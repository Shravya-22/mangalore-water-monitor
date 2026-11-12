"""
Database Seeding Script
-----------------------
Populates SQLite / PostgreSQL database with:
- 8 Mangaluru Demonstration Service Areas
- 4 Synthetic Reservoir / Source Nodes
- Precomputed Multi-Horizon Forecasts from LightGBM Models
- Initial Active and Acknowledged Alerts
- Public Crowdsourced Reports with Moderation Queue
- Background Job Execution Audit Log
"""

import os
import json
import sqlite3
import pandas as pd
import numpy as np
import joblib
from datetime import datetime, timedelta

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from api.db import init_db, get_connection
from data_generator import DEMO_AREAS, SYNTHETIC_SOURCES

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")

CLASS_LABELS = {
    0: "NO CRISIS",
    1: "MINOR STRESS",
    2: "MODERATE CRISIS",
    3: "HIGH CRISIS",
    4: "CRITICAL CRISIS"
}

RISK_LEVELS = {
    0: "NORMAL",
    1: "ELEVATED",
    2: "MODERATE",
    3: "HIGH",
    4: "CRITICAL"
}

def seed_database():
    init_db()
    conn = get_connection()
    c = conn.cursor()

    # Load master dataset to get latest state (e.g., as of 2024-12-31 or current simulation date)
    master_path = os.path.join(DATA_DIR, "mangaluru_master_dataset.csv")
    master_df = pd.read_csv(master_path)
    latest_date = master_df["measurement_date"].max()
    latest_rows = master_df[master_df["measurement_date"] == latest_date].set_index("location_code")

    # 1. Seed Demonstration Service Areas
    c.execute("DELETE FROM demo_areas")
    for a in DEMO_AREAS:
        code = a["code"]
        row = latest_rows.loc[code] if code in latest_rows.index else None
        curr_lvl = int(row["crisis_level"]) if row is not None else 0
        curr_wsi = float(row["water_security_index"]) if row is not None else 0.55
        curr_demand = float(row["daily_water_demand_mld"]) if row is not None else round((a["population"] * a["base_lpcd"]) / 1e6, 2)
        curr_supply = float(row["daily_water_supply_mld"]) if row is not None else curr_demand
        curr_gap = float(row["demand_supply_gap_mld"]) if row is not None else 0.0

        c.execute("""
        INSERT INTO demo_areas (
            code, name, area_type, population, base_lpcd, gw_base_depth,
            nrw_base_pct, lat, lng, gw_vulnerability,
            current_crisis_level, current_wsi, current_demand_mld,
            current_supply_mld, current_gap_mld
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            code, a["name"], a["type"], a["population"], a["base_lpcd"],
            a["gw_base_depth"], a["nrw_base_pct"], a["lat"], a["lng"],
            a["gw_vulnerability"], curr_lvl, curr_wsi, curr_demand,
            curr_supply, curr_gap
        ))

    # 2. Seed Water Sources
    c.execute("DELETE FROM water_sources")
    res_df = pd.read_csv(os.path.join(DATA_DIR, "mangaluru_reservoir_daily.csv"))
    latest_res = res_df[res_df["measurement_date"] == latest_date].set_index("source_id")

    for s in SYNTHETIC_SOURCES:
        sid = s["source_id"]
        row = latest_res.loc[sid] if sid in latest_res.index else None
        curr_storage = float(row["storage_level_mcm"]) if row is not None else round(s["capacity_mcm"] * 0.70, 2)
        curr_pct = float(row["storage_percentage"]) if row is not None else 70.0
        curr_inflow = float(row["inflow_mcm"]) if row is not None else 0.12
        curr_outflow = float(row["outflow_mcm"]) if row is not None else 0.09
        status = str(row["water_availability_status"]) if row is not None else "Adequate"

        c.execute("""
        INSERT INTO water_sources (
            source_id, source_name, location_code, capacity_mcm,
            current_storage_mcm, storage_percentage, current_inflow_mcm,
            current_outflow_mcm, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sid, s["source_name"], s["location_code"], s["capacity_mcm"],
            curr_storage, curr_pct, curr_inflow, curr_outflow, status
        ))

    # 3. Seed Precomputed Multi-Horizon Forecasts using Trained Models
    c.execute("DELETE FROM predictions")
    print("Generating model-driven predictions for all service areas...")

    # Load trained LightGBM models
    models = {}
    for h in ["1d", "7d", "14d"]:
        m_path = os.path.join(MODELS_DIR, f"lightgbm_{h}.joblib")
        if os.path.exists(m_path):
            models[h] = joblib.load(m_path)
    
    scaler_path = os.path.join(MODELS_DIR, "robust_scaler.joblib")
    scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None

    # Load feature pipeline features
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from etl.feature_pipeline import build_features, prepare_ml_matrices
    full_feats = build_features(master_df)

    latest_date_dt = pd.to_datetime(latest_date)

    for h, horizon_days in [("1d", 1), ("7d", 7), ("14d", 14)]:
        if h not in models:
            continue
        model = models[h]
        X, _, feature_cols, dates, locs = prepare_ml_matrices(full_feats, horizon=h)
        
        # Take the most recent observation for each area to predict future horizon
        # For demonstration, use observations from the last available date in the dataset
        for area in DEMO_AREAS:
            code = area["code"]
            area_mask = (locs == code)
            if not area_mask.any():
                continue
            
            # Last available row for this area
            last_idx = X[area_mask].index[-1]
            x_row = X.loc[[last_idx]]
            x_scaled = scaler.transform(x_row) if scaler else x_row

            pred_class = int(model.predict(x_scaled)[0])
            probs = model.predict_proba(x_scaled)[0]

            # Adjust if model output doesn't have 5 columns
            full_probs = [0.0] * 5
            for i, p in enumerate(probs):
                if i < 5:
                    full_probs[i] = float(p)
            
            conf = float(np.max(full_probs) * 100.0)
            target_dt = (latest_date_dt + timedelta(days=horizon_days)).strftime("%Y-%m-%d")

            c.execute("""
            INSERT INTO predictions (
                area_code, target_date, horizon, predicted_class, class_label,
                confidence_pct, probability_level_0, probability_level_1,
                probability_level_2, probability_level_3, probability_level_4,
                risk_level, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                code, target_dt, h, pred_class, CLASS_LABELS[pred_class],
                round(conf, 1), round(full_probs[0], 3), round(full_probs[1], 3),
                round(full_probs[2], 3), round(full_probs[3], 3), round(full_probs[4], 3),
                RISK_LEVELS[pred_class], datetime.now().isoformat()
            ))

    # 4. Seed Alerts
    c.execute("DELETE FROM alerts")
    sample_alerts = [
        ("ALT-MNG-101", "ULL", "2024-12-30", "CRITICAL", "Aquifer Salinity Ingress Warning",
         "Groundwater drawdown reached 14.8m near estuary with chloride level elevation",
         "Halt unmetered commercial pumping and redirect Thumbe surface line tanker supplies", "ACTIVE"),
        ("ALT-MNG-102", "KAD", "2024-12-28", "HIGH", "High-Elevation Distribution Pressure Deficit",
         "Elevation head loss causing intermittent supply drop below 90 LPCD in Kadri Hills",
         "Operate booster pump station on Stage-2 line; notify ward engineering officer", "ACTIVE"),
        ("ALT-MNG-103", "SUR", "2024-12-25", "MODERATE", "Secondary Main Leakage Spike",
         "NRW losses exceeded 38.5% on Baikampady connector branch",
         "Acoustic pipe leak detection team dispatched for nocturnal survey", "ACKNOWLEDGED"),
        ("ALT-MNG-104", "HAM", "2024-12-20", "ELEVATED", "Commercial Peak Influx Surge",
         "Daytime central market demand peaked 22% above weekly baseline",
         "Regulate feeder valves and utilize commercial balancing storage", "RESOLVED"),
        ("ALT-MNG-105", "BEJ", "2024-12-18", "HIGH", "Transit Hub Pipeline Replacement",
         "Scheduled valve maintenance on KSRTC arterial pipeline",
         "Deploy 4 emergency municipal drinking water tankers to Bejai circle", "RESOLVED")
    ]

    for alt in sample_alerts:
        c.execute("""
        INSERT INTO alerts (
            alert_id, area_code, alert_date, severity, title, reason,
            recommended_action, status, acknowledged_by, acknowledged_at, resolved_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alt[0], alt[1], alt[2], alt[3], alt[4], alt[5], alt[6], alt[7],
            "MCC Executive Engineer" if alt[7] in ["ACKNOWLEDGED", "RESOLVED"] else None,
            "2024-12-26T10:30:00" if alt[7] in ["ACKNOWLEDGED", "RESOLVED"] else None,
            "2024-12-22T17:00:00" if alt[7] == "RESOLVED" else None
        ))

    # 5. Seed Public Citizen Reports & Moderation Queue
    c.execute("DELETE FROM public_reports")
    sample_reports = [
        ("REP-MNG-201", "Ramesh Pai", "9845012345", "KAD", "Low water pressure", "HIGH",
         "Temple road residents getting low tap pressure for past 3 days despite regular supply hours.",
         12.8920, 74.8630, "2024-12-30T08:15:00", "PENDING", None, None),
        ("REP-MNG-202", "Shabana Begum", "9741098765", "ULL", "Water contamination", "CRITICAL",
         "Borewell water in ward 54 tastes brackish/saline with slight turbidity.",
         12.8080, 74.8540, "2024-12-29T14:20:00", "APPROVED", "Moderator (Health Dept)", "2024-12-29T16:00:00"),
        ("REP-MNG-203", "Karthik Shenoy", "8970034567", "BEJ", "Pipeline leakage", "MODERATE",
         "Visible clean water pooling near Bejai market junction from broken distributor joint.",
         12.8860, 74.8495, "2024-12-28T11:45:00", "APPROVED", "Moderator (KUWSDB)", "2024-12-28T12:30:00"),
        ("REP-MNG-204", "Ashwin Rao", None, "HAM", "Water shortage", "MODERATE",
         "Intermittent tap supply in commercial complex behind railway station.",
         12.8705, 74.8445, "2024-12-27T09:10:00", "REJECTED", "Moderator (Desk)", "2024-12-27T10:00:00")
    ]

    for rep in sample_reports:
        c.execute("""
        INSERT INTO public_reports (
            report_id, reporter_name, contact_info, area_code, issue_type,
            severity, description, latitude, longitude, reported_at,
            moderation_status, moderated_by, moderated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, rep)

    # 6. Seed ETL & Background Jobs Log
    c.execute("DELETE FROM etl_jobs")
    sample_jobs = [
        ("JOB-ETL-001", "file_import", "SUCCESS", "2024-12-31T06:00:00", "2024-12-31T06:00:15", 15.2, 5848,
         "Ingested daily hydrometric files for Mangaluru demo areas"),
        ("JOB-ETL-002", "feature_generation", "SUCCESS", "2024-12-31T06:00:18", "2024-12-31T06:01:05", 47.0, 5848,
         "Calculated 111 temporal, rolling, lag, and Water Security Index features"),
        ("JOB-ETL-003", "model_training", "SUCCESS", "2024-12-31T06:01:10", "2024-12-31T06:02:40", 90.0, 5848,
         "Trained LightGBM (1d, 7d, 14d), XGBoost (7d), and Random Forest (7d)"),
        ("JOB-ETL-004", "prediction_run", "SUCCESS", "2024-12-31T06:02:45", "2024-12-31T06:03:00", 15.0, 8,
         "Generated probabilistic multi-horizon forecasts for all 8 Mangaluru areas")
    ]

    for j in sample_jobs:
        c.execute("""
        INSERT INTO etl_jobs (
            job_id, job_type, status, started_at, finished_at, duration_seconds, records_processed, log_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, j)

    conn.commit()
    conn.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
