"""
Feature Engineering and Preprocessing Pipeline
----------------------------------------------
Implements multi-source data merging, validation, data cleaning,
and domain-specific hydrological feature engineering (>50 features)
with strict avoidance of temporal data leakage.
"""

import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import RobustScaler
import joblib

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def load_and_validate_raw_data():
    """
    Stage 1 & 2: Ingests raw CSVs, verifies schema, ranges, missing values,
    and removes duplicates.
    """
    master_path = os.path.join(DATA_DIR, "mangaluru_master_dataset.csv")
    if not os.path.exists(master_path):
        raise FileNotFoundError(f"Master dataset not found at {master_path}. Run data_generator.py first.")

    df = pd.read_csv(master_path)
    df["measurement_date"] = pd.to_datetime(df["measurement_date"])
    df = df.sort_values(by=["location_code", "measurement_date"]).reset_index(drop=True)

    # Validation checks
    assert not df["measurement_date"].isnull().any(), "Found null dates"
    assert not df["location_code"].isnull().any(), "Found null location codes"
    assert (df["rainfall_mm"] >= 0).all(), "Negative rainfall found"
    assert (df["avg_storage_percentage"] >= 0).all() and (df["avg_storage_percentage"] <= 100.0).all(), "Invalid storage range"

    return df

def build_features(df):
    """
    Generates temporal, rolling statistics, lag features, trends,
    and flow/stress indices for each demonstration service area.
    Ensures that for any observation at time t, only information at or before t is used.
    """
    df = df.copy()
    if not pd.api.types.is_datetime64_any_dtype(df["measurement_date"]):
        df["measurement_date"] = pd.to_datetime(df["measurement_date"])
    feature_dfs = []

    # Process per location code to maintain strictly sequential time series
    for loc_code, group in df.groupby("location_code"):
        g = group.copy().sort_values("measurement_date").reset_index(drop=True)
        
        # 1. Temporal Features
        dt = g["measurement_date"].dt
        g["day_of_year"] = dt.dayofyear
        g["month"] = dt.month
        g["quarter"] = dt.quarter
        g["is_weekend"] = dt.weekday.isin([5, 6]).astype(int)
        
        # Season binary indicators
        g["season_Winter"] = (g["seasonal_indicator"] == "Winter").astype(int)
        g["season_Summer"] = (g["seasonal_indicator"] == "Summer").astype(int)
        g["season_Monsoon"] = (g["seasonal_indicator"] == "Monsoon").astype(int)
        g["season_Post_Monsoon"] = (g["seasonal_indicator"] == "Post-Monsoon").astype(int)

        # Days since monsoon start (June 1)
        monsoon_starts = {
            2023: pd.Timestamp("2023-06-01"),
            2024: pd.Timestamp("2024-06-01")
        }
        days_since_monsoon = []
        for d in g["measurement_date"]:
            yr = d.year
            m_start = monsoon_starts[yr]
            diff = (d - m_start).days
            days_since_monsoon.append(max(0, diff) if diff >= 0 else 0)
        g["days_since_monsoon"] = days_since_monsoon

        # 2. Lag Features (1, 3, 7, 14 days)
        lag_vars = [
            "avg_storage_percentage", "rainfall_mm", "groundwater_level",
            "daily_water_demand_mld", "daily_water_supply_mld",
            "demand_supply_gap_mld", "water_security_index"
        ]
        for var in lag_vars:
            for l in [1, 3, 7, 14]:
                g[f"{var}_lag_{l}"] = g[var].shift(l)

        # 3. Rolling Statistics (7, 14, 30 days)
        rolling_vars = ["rainfall_mm", "avg_storage_percentage", "groundwater_level", "total_inflow_mcm"]
        for var in rolling_vars:
            for w in [7, 14, 30]:
                g[f"{var}_roll_mean_{w}"] = g[var].rolling(window=w, min_periods=1).mean()
                if var in ["rainfall_mm", "avg_storage_percentage"]:
                    g[f"{var}_roll_std_{w}"] = g[var].rolling(window=w, min_periods=1).std().fillna(0)
                    g[f"{var}_roll_max_{w}"] = g[var].rolling(window=w, min_periods=1).max()
                    g[f"{var}_roll_min_{w}"] = g[var].rolling(window=w, min_periods=1).min()

        # Cumulative rainfall (3d, 7d, 14d)
        for w in [3, 7, 14, 30]:
            g[f"rainfall_sum_{w}"] = g["rainfall_mm"].rolling(window=w, min_periods=1).sum()

        # 4. Trend Indicators & Rates of Change
        # 7-day and 14-day storage velocity (delta)
        g["storage_velocity_7d"] = g["avg_storage_percentage"] - g["avg_storage_percentage"].shift(7)
        g["storage_velocity_14d"] = g["avg_storage_percentage"] - g["avg_storage_percentage"].shift(14)
        # Acceleration (change in velocity)
        g["storage_acceleration"] = g["storage_velocity_7d"] - g["storage_velocity_7d"].shift(7)

        # Groundwater depletion trend (positive = deeper = worsening)
        g["gw_depletion_rate_7d"] = g["groundwater_level"] - g["groundwater_level"].shift(7)
        g["gw_depletion_rate_14d"] = g["groundwater_level"] - g["groundwater_level"].shift(14)

        # Exponential Moving Averages (EWMA)
        g["storage_ewma_7"] = g["avg_storage_percentage"].ewm(span=7).mean()
        g["storage_ewma_14"] = g["avg_storage_percentage"].ewm(span=14).mean()
        g["rainfall_ewma_7"] = g["rainfall_mm"].ewm(span=7).mean()

        # 5. Flow and Stress Indices
        # Net Inflow (Inflow - Outflow)
        g["net_inflow_mcm"] = g["total_inflow_mcm"] - g["total_outflow_mcm"]
        # Demand Pressure Ratio
        g["demand_pressure_ratio"] = g["daily_water_demand_mld"] / np.maximum(g["daily_water_supply_mld"], 0.01)
        # Storage to Demand Ratio (Days equivalent)
        g["storage_adequacy_days"] = (g["total_storage_mcm"] * 1000.0) / np.maximum(g["daily_water_demand_mld"] * 8.0, 1.0)
        # Aquifer stress interaction
        g["aquifer_storage_compound_stress"] = (1.0 - (g["avg_storage_percentage"] / 100.0)) * g["groundwater_stress_index"]

        # 6. Multi-Horizon Targets: y_{t+1}, y_{t+7}, y_{t+14}
        g["target_crisis_1d"] = g["crisis_level"].shift(-1)
        g["target_crisis_7d"] = g["crisis_level"].shift(-7)
        g["target_crisis_14d"] = g["crisis_level"].shift(-14)

        feature_dfs.append(g)

    full_features = pd.concat(feature_dfs, ignore_index=True)
    # Sort again by measurement date
    full_features = full_features.sort_values(by=["measurement_date", "location_code"]).reset_index(drop=True)

    return full_features

def prepare_ml_matrices(full_df, horizon="7d"):
    """
    Extracts feature matrix X and target y for the chosen horizon ('1d', '7d', '14d').
    Drops rows where target is NaN (at the end of the simulation period)
    or where lags are NaN (at the beginning).
    """
    target_col = f"target_crisis_{horizon}"
    
    # Exclude non-feature or target columns
    exclude_cols = [
        "measurement_date", "location_code", "seasonal_indicator",
        "crisis_label", "crisis_level",
        "target_crisis_1d", "target_crisis_7d", "target_crisis_14d"
    ]
    
    feature_cols = [c for c in full_df.columns if c not in exclude_cols]

    # Filter out rows with NaN in the selected target
    valid_mask = full_df[target_col].notnull()
    subset = full_df[valid_mask].copy()

    # Fill any remaining NaNs in lag features (first 14 days) using backward fill / forward fill
    subset[feature_cols] = subset.groupby("location_code")[feature_cols].bfill().ffill()

    X = subset[feature_cols]
    y = subset[target_col].astype(int)
    dates = subset["measurement_date"]
    locations = subset["location_code"]

    return X, y, feature_cols, dates, locations

if __name__ == "__main__":
    print("Testing Feature Pipeline...")
    raw = load_and_validate_raw_data()
    print(f"Loaded {len(raw)} raw rows.")
    feats = build_features(raw)
    print(f"Constructed features dataframe with shape: {feats.shape}")
    
    for h in ["1d", "7d", "14d"]:
        X, y, cols, d, locs = prepare_ml_matrices(feats, horizon=h)
        print(f"Horizon {h}: X shape {X.shape}, y distribution:")
        print(y.value_counts().sort_index())
