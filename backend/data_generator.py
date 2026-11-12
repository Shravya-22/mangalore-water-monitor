"""
Mangaluru Urban Water Crisis Synthetic Data Generator
------------------------------------------------------
Generates realistic, reproducible synthetic hydrological, meteorological,
operational, and crisis event data for 8 demonstration service areas in Mangaluru,
Karnataka, India for the period 2023-01-01 to 2024-12-31 (731 days, 5,848 master records).

Hydrological context:
- Coastal Arabian Sea setting (12.91° N, 74.85° E)
- Southwest Monsoon (June-Sept, 3500-4000mm annual rainfall)
- Netravati and Gurupura river basin hydrology
- Severe pre-monsoon summer stress (March-May) with dry riverbeds & groundwater drawdown
- 8 Demonstration Service Areas: Hampankatta, Kadri, Bejai, Kankanady, Bendoor, Urwa, Surathkal, Ullal
- Synthetic/labeled infrastructure: Thumbe Vented Dam Intake (S1), AMR Vent-Dam (S2),
  Gurupura Basin Station (S3), Urban Infiltration Well Battery (S4).

All generated datasets are clearly marked as:
*** SYNTHETIC / SIMULATED RESEARCH DATA - NOT OFFICIAL GOVERNMENT MEASUREMENTS ***
"""

import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Set deterministic random seed
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(OUTPUT_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Simulation date range: 2023-01-01 to 2024-12-31
START_DATE = datetime(2023, 1, 1)
END_DATE = datetime(2024, 12, 31)
NUM_DAYS = (END_DATE - START_DATE).days + 1  # 731 days
DATE_LIST = [START_DATE + timedelta(days=i) for i in range(NUM_DAYS)]

# 8 Demonstration Service Areas in Mangaluru
DEMO_AREAS = [
    {
        "code": "HAM",
        "name": "Hampankatta",
        "type": "Commercial & Transit Core",
        "population": 42000,
        "base_lpcd": 155,
        "gw_base_depth": 11.0,
        "nrw_base_pct": 34.5,
        "lat": 12.8698,
        "lng": 74.8430,
        "gw_vulnerability": "Medium"
    },
    {
        "code": "KAD",
        "name": "Kadri",
        "type": "Hilly Residential & Pilgrimage",
        "population": 68000,
        "base_lpcd": 145,
        "gw_base_depth": 14.5,
        "nrw_base_pct": 29.0,
        "lat": 12.8911,
        "lng": 74.8624,
        "gw_vulnerability": "High"
    },
    {
        "code": "BEJ",
        "name": "Bejai",
        "type": "Central Mixed Commercial & Hub",
        "population": 58000,
        "base_lpcd": 150,
        "gw_base_depth": 12.5,
        "nrw_base_pct": 36.2,
        "lat": 12.8856,
        "lng": 74.8488,
        "gw_vulnerability": "Medium"
    },
    {
        "code": "KAN",
        "name": "Kankanady",
        "type": "Healthcare & Institutional Corridor",
        "population": 52000,
        "base_lpcd": 160,
        "gw_base_depth": 10.5,
        "nrw_base_pct": 28.5,
        "lat": 12.8622,
        "lng": 74.8617,
        "gw_vulnerability": "Low"
    },
    {
        "code": "BEN",
        "name": "Bendoor",
        "type": "High-Density Residential & Educational",
        "population": 48000,
        "base_lpcd": 140,
        "gw_base_depth": 11.8,
        "nrw_base_pct": 26.0,
        "lat": 12.8765,
        "lng": 74.8562,
        "gw_vulnerability": "Low"
    },
    {
        "code": "URW",
        "name": "Urwa",
        "type": "Coastal-Adjacent Urban & Market",
        "population": 44000,
        "base_lpcd": 142,
        "gw_base_depth": 7.5,
        "nrw_base_pct": 31.0,
        "lat": 12.8985,
        "lng": 74.8329,
        "gw_vulnerability": "Medium"
    },
    {
        "code": "SUR",
        "name": "Surathkal",
        "type": "Northern Industrial & Academic Fringe",
        "population": 76000,
        "base_lpcd": 152,
        "gw_base_depth": 9.2,
        "nrw_base_pct": 33.5,
        "lat": 13.0078,
        "lng": 74.7937,
        "gw_vulnerability": "High"
    },
    {
        "code": "ULL",
        "name": "Ullal",
        "type": "Southern Coastal Estuary & High Vulnerability",
        "population": 62000,
        "base_lpcd": 138,
        "gw_base_depth": 6.8,
        "nrw_base_pct": 38.0,
        "lat": 12.8056,
        "lng": 74.8565,
        "gw_vulnerability": "Critical (Saline Risk)"
    }
]

# 4 Synthetic Reservoirs / Water Sources
SYNTHETIC_SOURCES = [
    {
        "source_id": "SRC-THUMBE",
        "source_name": "Thumbe Vented Dam Intake (Netravati River - Synthetic S1)",
        "location_code": "NETRAVATI_THUMBE",
        "capacity_mcm": 14.73,
        "share_pct": 0.58
    },
    {
        "source_id": "SRC-AMR",
        "source_name": "AMR Vent-Dam Balancing Storage (Upstream Netravati - Synthetic S2)",
        "location_code": "NETRAVATI_AMR",
        "capacity_mcm": 10.25,
        "share_pct": 0.22
    },
    {
        "source_id": "SRC-GURUPURA",
        "source_name": "Gurupura Basin Intake Station (Phalguni River - Synthetic S3)",
        "location_code": "GURUPURA_STN",
        "capacity_mcm": 6.50,
        "share_pct": 0.12
    },
    {
        "source_id": "SRC-WELLS",
        "source_name": "Municipal Infiltration Galleries & Deep Well Battery (Synthetic S4)",
        "location_code": "MANGALURU_AQUIFER",
        "capacity_mcm": 3.80,
        "share_pct": 0.08
    }
]

TOTAL_CAPACITY_MCM = sum(s["capacity_mcm"] for s in SYNTHETIC_SOURCES)  # ~35.28 MCM

def get_season(dt):
    m = dt.month
    if m in [12, 1, 2]:
        return "Winter"
    elif m in [3, 4, 5]:
        return "Summer"
    elif m in [6, 7, 8, 9]:
        return "Monsoon"
    else:
        return "Post-Monsoon"

def generate_climate_daily():
    records = []
    # Base climate time series across Mangaluru coastal plain
    for dt in DATE_LIST:
        doy = dt.timetuple().tm_yday
        month = dt.month
        year = dt.year
        season = get_season(dt)
        monsoon_indicator = 1 if season == "Monsoon" else 0

        # Coastal Mangaluru seasonal climate simulation
        if season == "Monsoon":
            # June-September: Torrential downpours, high cloud cover, lower max temp, high humidity
            # July has maximum rainfall
            peak_factor = 1.35 if month == 7 else (1.15 if month == 8 else (1.0 if month == 6 else 0.8))
            is_rainy_day = np.random.rand() < 0.82
            if is_rainy_day:
                # Gamma distributed rainfall with frequent heavy events (20-180 mm)
                rainfall = float(np.clip(np.random.gamma(shape=1.8, scale=24.0 * peak_factor), 0.5, 245.0))
                # Occasional extreme cyclonic/monsoon storm
                if np.random.rand() < 0.06:
                    rainfall += np.random.uniform(50.0, 110.0)
            else:
                rainfall = 0.0
            
            t_max = float(np.random.normal(28.5, 1.2))
            t_min = float(np.random.normal(23.8, 0.8))
            humidity = float(np.clip(np.random.normal(88.0, 4.5), 72.0, 99.0))

        elif season == "Post-Monsoon":
            # October-November: Thunderstorms, cyclonic spells
            is_rainy_day = np.random.rand() < 0.42
            if is_rainy_day:
                rainfall = float(np.clip(np.random.gamma(shape=1.2, scale=18.0), 0.2, 135.0))
            else:
                rainfall = 0.0
            t_max = float(np.random.normal(30.8, 1.4))
            t_min = float(np.random.normal(23.2, 1.1))
            humidity = float(np.clip(np.random.normal(78.0, 5.0), 65.0, 92.0))

        elif season == "Summer":
            # March-May: Hot, humid, dry, desiccating heat, rare May pre-monsoon showers
            if month == 5 and np.random.rand() < 0.25:
                rainfall = float(np.clip(np.random.exponential(scale=14.0), 1.0, 65.0))
            elif month == 4 and np.random.rand() < 0.08:
                rainfall = float(np.clip(np.random.exponential(scale=8.0), 0.5, 30.0))
            else:
                rainfall = 0.0
            t_max = float(np.random.normal(34.2, 1.3))
            t_min = float(np.random.normal(25.8, 1.0))
            humidity = float(np.clip(np.random.normal(74.0, 5.5), 58.0, 88.0))

        else:  # Winter
            # Dec-Feb: Pleasant, almost zero rain, clear skies
            rainfall = float(np.random.exponential(scale=1.5)) if np.random.rand() < 0.04 else 0.0
            t_max = float(np.random.normal(32.1, 1.1))
            t_min = float(np.random.normal(21.4, 1.2))
            humidity = float(np.clip(np.random.normal(68.0, 6.0), 50.0, 82.0))

        t_avg = round((t_max + t_min) / 2.0, 2)
        rainfall = round(rainfall, 2)
        humidity = round(humidity, 1)

        # Replicate slight microclimate variations across the 8 demonstration areas
        for area in DEMO_AREAS:
            loc_code = area["code"]
            # Surathkal and Ullal on coast have slightly higher humidity, Kadri on hills slightly lower min temp
            area_rain = rainfall
            if rainfall > 0:
                area_rain = round(max(0.0, rainfall * np.random.uniform(0.92, 1.08)), 2)
            
            area_tmax = round(t_max + np.random.uniform(-0.4, 0.4), 2)
            area_tmin = round(t_min + np.random.uniform(-0.3, 0.3), 2)
            area_tavg = round((area_tmax + area_tmin) / 2.0, 2)
            area_hum = round(float(np.clip(humidity + np.random.uniform(-2.0, 2.5), 45.0, 99.0)), 1)

            records.append({
                "measurement_date": dt.strftime("%Y-%m-%d"),
                "location_code": loc_code,
                "temperature_min": area_tmin,
                "temperature_max": area_tmax,
                "temperature_avg": area_tavg,
                "rainfall_mm": area_rain,
                "humidity": area_hum,
                "monsoon_indicator": monsoon_indicator,
                "seasonal_indicator": season
            })

    return pd.DataFrame(records)

def generate_reservoir_daily(climate_df):
    """
    Simulates daily reservoir levels and streamflow for the 4 synthetic sources
    based on catchment rainfall in the Western Ghats / coastal river basins.
    """
    records = []
    
    # Precompute daily average rainfall across Mangaluru
    daily_rain = climate_df.groupby("measurement_date")["rainfall_mm"].mean().to_dict()

    # Track storage states for each source
    storage_state = {s["source_id"]: s["capacity_mcm"] * 0.78 for s in SYNTHETIC_SOURCES}

    for dt in DATE_LIST:
        date_str = dt.strftime("%Y-%m-%d")
        rain_today = daily_rain.get(date_str, 0.0)
        season = get_season(dt)
        month = dt.month

        for src in SYNTHETIC_SOURCES:
            sid = src["source_id"]
            cap = src["capacity_mcm"]
            prev_vol = storage_state[sid]

            # Inflow and Outflow calibrated to Mangaluru coastal hydrology
            if season == "Monsoon":
                # Torrential river inflows (June to September)
                base_inflow = cap * 0.08 * (1.3 if month == 7 else (1.1 if month == 8 else 0.9))
                rain_inflow = (rain_today / 20.0) * (cap * 0.20)
                inflow = base_inflow + rain_inflow + np.random.normal(0, cap * 0.005)
                # Spilling over gates when full
                if prev_vol + inflow > cap:
                    outflow = (prev_vol + inflow - cap) + cap * 0.005
                else:
                    outflow = cap * 0.004 * np.random.uniform(0.95, 1.05)

            elif season == "Post-Monsoon":
                # Receding streamflow (October to November)
                base_inflow = cap * (0.007 if month == 10 else 0.0035)
                rain_inflow = (rain_today / 35.0) * (cap * 0.04)
                inflow = base_inflow + rain_inflow + np.random.normal(0, cap * 0.001)
                outflow = cap * (0.006 if month == 10 else 0.007) * np.random.uniform(0.96, 1.04)

            elif season == "Winter":
                # Declining baseflow, no rain (December to February)
                decay = 0.0018 if month == 12 else (0.0010 if month == 1 else 0.0006)
                inflow = cap * decay + max(0, np.random.normal(0, cap * 0.0001))
                outflow = cap * (0.0065 if month == 12 else 0.0075) * np.random.uniform(0.97, 1.03)

            else:  # Summer (March to May) - critical water stress
                # Inflow drops to near zero
                summer_inflow_factor = 0.0004 if month == 3 else (0.00015 if month == 4 else 0.00008)
                inflow = cap * summer_inflow_factor + (rain_today / 50.0) * (cap * 0.02) + max(0, np.random.normal(0, cap * 0.00005))
                # Base municipal draft + high summer evaporation
                outflow_rate = 0.0090 if month == 3 else (0.0098 if month == 4 else 0.0105)
                # Rationing response when storage drops
                if prev_vol < cap * 0.15:
                    outflow_rate *= 0.65
                elif prev_vol < cap * 0.28:
                    outflow_rate *= 0.80
                outflow = cap * outflow_rate * np.random.uniform(0.96, 1.04)

            inflow = float(max(0.0005, inflow))
            outflow = float(max(0.0005, outflow))

            # Evaporation
            evap_loss = prev_vol * (0.0015 if season == "Summer" else 0.0005)
            new_vol = prev_vol + inflow - outflow - evap_loss
            new_vol = float(np.clip(new_vol, cap * 0.04, cap))
            storage_pct = round((new_vol / cap) * 100.0, 2)
            storage_state[sid] = new_vol

            storage_change_rate = round(new_vol - prev_vol, 4)

            # Availability Status
            if storage_pct >= 60.0:
                avail_status = "Optimal"
            elif storage_pct >= 40.0:
                avail_status = "Adequate"
            elif storage_pct >= 25.0:
                avail_status = "Depleting"
            elif storage_pct >= 12.0:
                avail_status = "Stressed"
            else:
                avail_status = "Critical"

            records.append({
                "measurement_date": date_str,
                "source_id": sid,
                "source_name": src["source_name"],
                "location_code": src["location_code"],
                "storage_capacity_mcm": round(cap, 2),
                "storage_level_mcm": round(new_vol, 3),
                "storage_percentage": storage_pct,
                "inflow_mcm": round(inflow, 3),
                "outflow_mcm": round(outflow, 3),
                "storage_change_rate": storage_change_rate,
                "water_availability_status": avail_status
            })

    return pd.DataFrame(records)

def generate_groundwater_daily(climate_df):
    """
    Groundwater table depth (meters below ground level), drawdown, recharge,
    pumping rate, and stress index for all 8 service areas.
    """
    records = []
    daily_rain = climate_df.groupby(["measurement_date", "location_code"])["rainfall_mm"].first().to_dict()

    # Initial depths
    curr_depths = {area["code"]: area["gw_base_depth"] + 1.2 for area in DEMO_AREAS}

    for dt in DATE_LIST:
        date_str = dt.strftime("%Y-%m-%d")
        season = get_season(dt)
        month = dt.month

        for area in DEMO_AREAS:
            code = area["code"]
            base_d = area["gw_base_depth"]
            rain = daily_rain.get((date_str, code), 0.0)
            prev_d = curr_depths[code]

            # Infiltration recharge from rainfall (coastal lateritic soils)
            recharge = (rain * 0.038) if rain > 2.0 else 0.0

            # Daily pumping rate MLD in this zone
            # Summer increases domestic groundwater abstraction due to piped rationing
            pumping_base = (area["population"] * 0.000045)  # ~1.8 to 3.5 MLD
            if season == "Summer":
                pumping_rate = pumping_base * np.random.uniform(1.4, 1.85)
            elif season == "Monsoon":
                pumping_rate = pumping_base * np.random.uniform(0.65, 0.85)
            else:
                pumping_rate = pumping_base * np.random.uniform(0.95, 1.15)

            # Drawdown rate (depth increases as water drops)
            drawdown_increment = (pumping_rate / pumping_base) * 0.032 - recharge
            new_depth = prev_d + drawdown_increment + np.random.normal(0, 0.015)

            # Bounds for coastal aquifer: min depth (monsoon) ~1.8m, max summer depth ~18.5m
            new_depth = float(np.clip(new_depth, 1.8, 19.5))
            curr_depths[code] = new_depth

            drawdown = max(0.0, new_depth - (base_d * 0.65))
            # Groundwater stress index (0 to 1)
            gw_stress_index = round(float(np.clip((new_depth - 3.0) / (16.5 - 3.0), 0.0, 1.0)), 3)

            records.append({
                "measurement_date": date_str,
                "location_code": code,
                "groundwater_level": round(new_depth, 2),  # depth to water in meters
                "groundwater_drawdown": round(drawdown, 2),
                "groundwater_recharge": round(recharge, 3),
                "groundwater_pumping_rate": round(pumping_rate, 2),
                "groundwater_stress_index": gw_stress_index
            })

    return pd.DataFrame(records)

def generate_demand_daily(res_df, climate_df):
    """
    Generates daily demand, municipal supply, deficit gap, per capita LPCD,
    coverage %, and days of supply remaining for 8 areas.
    """
    records = []
    # System average storage percentage per day
    avg_storage = res_df.groupby("measurement_date")["storage_percentage"].mean().to_dict()
    total_stored_mcm = res_df.groupby("measurement_date")["storage_level_mcm"].sum().to_dict()

    for dt in DATE_LIST:
        date_str = dt.strftime("%Y-%m-%d")
        season = get_season(dt)
        st_pct = avg_storage.get(date_str, 50.0)
        st_mcm = total_stored_mcm.get(date_str, 18.0)

        for area in DEMO_AREAS:
            code = area["code"]
            pop = area["population"]
            base_lpcd = area["base_lpcd"]

            # Summer seasonal demand surge (+12% to +24%)
            if season == "Summer":
                demand_factor = np.random.uniform(1.15, 1.25)
            elif season == "Monsoon":
                demand_factor = np.random.uniform(0.92, 0.98)
            elif season == "Post-Monsoon":
                demand_factor = np.random.uniform(0.97, 1.02)
            else:
                demand_factor = np.random.uniform(0.98, 1.04)

            # Daily demand in MLD (Million Litres per Day)
            demand_mld = (pop * base_lpcd * demand_factor) / 1e6

            # Municipal supply availability based on system storage percentage
            if st_pct > 60.0:
                supply_ratio = np.random.uniform(0.97, 1.01)
            elif st_pct > 40.0:
                supply_ratio = np.random.uniform(0.91, 0.97)
            elif st_pct > 25.0:
                # Moderate rationing
                supply_ratio = np.random.uniform(0.80, 0.90)
            elif st_pct > 14.0:
                # High rationing
                supply_ratio = np.random.uniform(0.65, 0.79)
            else:
                # Critical emergency rationing
                supply_ratio = np.random.uniform(0.48, 0.64)

            # Coastal elevation effect: Kadri (high altitude) experiences higher supply deficits
            if code == "KAD":
                supply_ratio *= 0.94
            # Ullal & Surathkal peripheral pipeline reach
            elif code in ["ULL", "SUR"]:
                supply_ratio *= 0.96

            supply_mld = demand_mld * min(1.0, supply_ratio)
            gap_mld = max(0.0, demand_mld - supply_mld)
            actual_lpcd = (supply_mld * 1e6) / pop
            supply_coverage = (supply_mld / demand_mld) * 100.0

            # Days of supply remaining for the urban system:
            # Stored MCM * 1000 / Daily Total Water Draw (~125 MLD total system)
            days_remaining = max(1.0, (st_mcm * 1000.0) / 128.0)

            records.append({
                "measurement_date": date_str,
                "location_code": code,
                "population_estimate": pop,
                "daily_water_demand_mld": round(demand_mld, 2),
                "daily_water_supply_mld": round(supply_mld, 2),
                "demand_supply_gap_mld": round(gap_mld, 2),
                "water_consumption_per_capita": round(actual_lpcd, 1),
                "supply_coverage_percentage": round(supply_coverage, 1),
                "days_of_supply_remaining": round(days_remaining, 1)
            })

    return pd.DataFrame(records)

def generate_nrw_daily(demand_df):
    """
    Non-Revenue Water (NRW) percentage, physical losses, and unbilled consumption.
    """
    records = []
    for idx, row in demand_df.iterrows():
        code = row["location_code"]
        area_info = next(a for a in DEMO_AREAS if a["code"] == code)
        base_nrw = area_info["nrw_base_pct"]

        # Small daily fluctuation + pressure surges during intermittency
        nrw_pct = float(np.clip(base_nrw + np.random.normal(0, 1.8), 18.0, 52.0))
        total_input_mld = row["daily_water_supply_mld"] * (1.0 + (nrw_pct / 100.0))
        water_loss_mld = total_input_mld * (nrw_pct / 100.0)
        billed_water_mld = total_input_mld - water_loss_mld

        records.append({
            "measurement_date": row["measurement_date"],
            "location_code": code,
            "total_water_input_mld": round(total_input_mld, 2),
            "billed_water_mld": round(billed_water_mld, 2),
            "estimated_water_loss_mld": round(water_loss_mld, 2),
            "nrw_percentage": round(nrw_pct, 1)
        })

    return pd.DataFrame(records)

def generate_event_log():
    """
    Generates realistic operational events, water contamination reports, pipeline bursts,
    emergency tanker rationing, and monsoon weather events.
    """
    event_types = [
        ("Water shortage", "High", "Critical raw water depletion in Netravati intake triggering alternate-day rationing", 0.22),
        ("Pipeline leakage", "Moderate", "Main transmission distribution line burst repaired by technical crew", 0.25),
        ("Water contamination", "High", "Turbidity surge and bacterial count spike following heavy storm runoff", 0.12),
        ("Pump failure", "High", "High-capacity booster pump electrical malfunction at Thumbe headworks", 0.14),
        ("Reduced water supply", "Moderate", "Scheduled power shutdown impacting regional distribution reservoir", 0.15),
        ("Heavy rainfall", "Low", "Torrential coastal monsoon precipitation; reservoir spillway gates operated", 0.20),
        ("Infrastructure maintenance", "Low", "Routine desilting and valve replacement on feeder pipeline", 0.18),
        ("Emergency water distribution", "Critical", "Mobile water tanker fleet deployed to elevated and coastal habitations", 0.10)
    ]

    records = []
    event_id = 1001

    for dt in DATE_LIST:
        date_str = dt.strftime("%Y-%m-%d")
        season = get_season(dt)

        # Higher likelihood of emergency/shortage in Summer; higher rain/leakage in Monsoon
        if season == "Summer":
            prob = 0.28
        elif season == "Monsoon":
            prob = 0.22
        else:
            prob = 0.10

        if np.random.rand() < prob:
            # Pick 1 or 2 areas
            area = random.choice(DEMO_AREAS)
            # Pick event suitable for season
            if season == "Summer":
                candidates = [e for e in event_types if e[0] in ["Water shortage", "Emergency water distribution", "Reduced water supply", "Pump failure"]]
            elif season == "Monsoon":
                candidates = [e for e in event_types if e[0] in ["Heavy rainfall", "Pipeline leakage", "Water contamination"]]
            else:
                candidates = [e for e in event_types if e[0] in ["Infrastructure maintenance", "Pipeline leakage", "Reduced water supply"]]
            
            ev_type, sev, base_desc, _ = random.choice(candidates)
            desc = f"{area['name']}: {base_desc}"
            # Recent events may be OPEN/INVESTIGATING, older RESOLVED
            days_ago = (END_DATE - dt).days
            if days_ago < 15 and sev in ["High", "Critical"]:
                status = random.choice(["Active", "Under Review", "Investigating"])
            else:
                status = "Resolved"

            records.append({
                "event_id": f"EVT-MNG-{event_id}",
                "event_date": date_str,
                "location_code": area["code"],
                "event_type": ev_type,
                "severity": sev,
                "description": desc,
                "event_status": status
            })
            event_id += 1

    return pd.DataFrame(records)

def generate_master_dataset(res_df, climate_df, gw_df, demand_df, nrw_df):
    """
    Creates unified master dataset containing all 5,848 records (731 days * 8 areas),
    calculates normalized indicators, Water Security Index (WSI), and synthetic ground-truth
    crisis classes (0: No Crisis, 1: Minor Stress, 2: Moderate Crisis, 3: High Crisis, 4: Critical Crisis).
    """
    # Group reservoir data by date to compute system-wide totals & averages
    res_agg = res_df.groupby("measurement_date").agg({
        "storage_level_mcm": "sum",
        "storage_percentage": "mean",
        "inflow_mcm": "sum",
        "outflow_mcm": "sum",
        "storage_change_rate": "sum"
    }).reset_index()
    res_agg.rename(columns={
        "storage_level_mcm": "total_storage_mcm",
        "storage_percentage": "avg_storage_percentage",
        "inflow_mcm": "total_inflow_mcm",
        "outflow_mcm": "total_outflow_mcm"
    }, inplace=True)

    # Merge area-level tables
    m1 = pd.merge(demand_df, climate_df, on=["measurement_date", "location_code"], how="inner")
    m2 = pd.merge(m1, gw_df, on=["measurement_date", "location_code"], how="inner")
    m3 = pd.merge(m2, nrw_df, on=["measurement_date", "location_code"], how="inner")
    master = pd.merge(m3, res_agg, on=["measurement_date"], how="inner")

    # Sort strictly chronologically and by location
    master["measurement_date"] = pd.to_datetime(master["measurement_date"])
    master = master.sort_values(by=["measurement_date", "location_code"]).reset_index(drop=True)

    # Compute Normalized Components for Water Security Index (WSI)
    # WSI = w1(Sp) + w2(R) + w3(I) - w4(D) - w5(Gd)
    # Sp: Storage % normalized to [0, 1]
    sp_norm = np.clip(master["avg_storage_percentage"] / 100.0, 0.0, 1.0)

    # R: 7-day cumulative rainfall normalized
    r_norm = np.clip(master["rainfall_mm"] / 120.0, 0.0, 1.0)

    # I: Total Inflow normalized (max typical ~60 MCM)
    i_norm = np.clip(master["total_inflow_mcm"] / 25.0, 0.0, 1.0)

    # D: Demand normalized (max per area demand ~15 MLD)
    d_norm = np.clip(master["daily_water_demand_mld"] / 14.0, 0.0, 1.0)

    # Gd: Groundwater Depletion / Stress normalized
    gd_norm = np.clip(master["groundwater_stress_index"], 0.0, 1.0)

    # WSI computation with equal weights w_i = 0.20
    # WSI_raw = 0.20*Sp + 0.20*R + 0.20*I - 0.20*D - 0.20*Gd
    # With D and Gd subtracted, raw ranges approx -0.4 to +0.6. Normalize linearly to [0, 1]:
    wsi_raw = 0.25 * sp_norm + 0.20 * r_norm + 0.20 * i_norm - 0.15 * d_norm - 0.20 * gd_norm
    # Theoretical min is -0.35, max is +0.65 -> range 1.0. Shift by +0.35 to map to [0, 1]
    wsi = np.clip((wsi_raw + 0.35) / 0.95, 0.0, 1.0)
    master["water_security_index"] = round(wsi, 3)

    # Five-Level Crisis Classification logic aligned with IEEE reference & FYP report:
    # Level 0 - NO CRISIS (approx 25-30%): Storage > 45%, low gap, healthy WSI
    # Level 1 - MINOR STRESS (approx 22-26%): Storage 35-45%, slight gap, moderate WSI
    # Level 2 - MODERATE CRISIS (approx 22-26%): Storage 22-35%, noticeable gap, low-moderate WSI
    # Level 3 - HIGH CRISIS (approx 12-16%): Storage 12-22%, significant deficit
    # Level 4 - CRITICAL CRISIS (approx 5-8%): Storage < 12%, severe deficit, emergency condition
    crisis_levels = []
    crisis_labels = []

    for idx, row in master.iterrows():
        st = row["avg_storage_percentage"]
        gap = row["demand_supply_gap_mld"]
        gw_s = row["groundwater_stress_index"]
        c_wsi = row["water_security_index"]
        cov = row["supply_coverage_percentage"]

        # Five-Level Crisis Classification logic directly following FYP & IEEE reference rules:
        # Level 4 – CRITICAL CRISIS: Storage < 5% or severe emergency rationing (gap > 3.2 MLD, cov < 72%)
        # Level 3 – HIGH CRISIS: Storage 5–15% or high rationing (gap > 2.0 MLD, cov < 82%)
        # Level 2 – MODERATE CRISIS: Storage 15–30% or visible rationing (gap > 1.0 MLD, cov < 90%)
        # Level 1 – MINOR STRESS: Storage 30–45% or slight deficit (gap > 0.4 MLD, cov < 96%)
        # Level 0 – NO CRISIS: Storage >= 45% and balanced supply-demand

        if st < 5.0 or (gap > 3.2 and cov < 72.0):
            lvl = 4
            lbl = "CRITICAL CRISIS"
        elif st < 15.0 or (gap > 2.0 and cov < 82.0):
            lvl = 3
            lbl = "HIGH CRISIS"
        elif st < 30.0 or (gap > 1.0 and cov < 90.0):
            lvl = 2
            lbl = "MODERATE CRISIS"
        elif st < 45.0 or gap > 0.4 or cov < 96.0:
            lvl = 1
            lbl = "MINOR STRESS"
        else:
            lvl = 0
            lbl = "NO CRISIS"

        crisis_levels.append(lvl)
        crisis_labels.append(lbl)

    master["crisis_level"] = crisis_levels
    master["crisis_label"] = crisis_labels
    master["measurement_date"] = master["measurement_date"].dt.strftime("%Y-%m-%d")

    return master

def main():
    print("=" * 70)
    print("MANGALURU SYNTHETIC HYDROLOGICAL DATA GENERATOR (2023 - 2024)")
    print("=" * 70)
    print(f"Simulation Period: {START_DATE.date()} to {END_DATE.date()} ({NUM_DAYS} days)")
    print(f"Demonstration Service Areas: {len(DEMO_AREAS)} locations across Mangaluru")
    print(f"Synthetic Water Sources: {len(SYNTHETIC_SOURCES)} intake/storage nodes")
    print("-" * 70)

    # Step 1: Climate
    print("Generating Climate Daily...")
    climate_df = generate_climate_daily()
    climate_path = os.path.join(DATA_DIR, "mangaluru_climate_daily.csv")
    climate_df.to_csv(climate_path, index=False)
    print(f" -> Saved {len(climate_df)} rows to {climate_path}")

    # Step 2: Reservoir
    print("Generating Reservoir Daily...")
    res_df = generate_reservoir_daily(climate_df)
    res_path = os.path.join(DATA_DIR, "mangaluru_reservoir_daily.csv")
    res_df.to_csv(res_path, index=False)
    print(f" -> Saved {len(res_df)} rows to {res_path}")

    # Step 3: Groundwater
    print("Generating Groundwater Daily...")
    gw_df = generate_groundwater_daily(climate_df)
    gw_path = os.path.join(DATA_DIR, "mangaluru_groundwater_daily.csv")
    gw_df.to_csv(gw_path, index=False)
    print(f" -> Saved {len(gw_df)} rows to {gw_path}")

    # Step 4: Demand
    print("Generating Water Demand Daily...")
    demand_df = generate_demand_daily(res_df, climate_df)
    demand_path = os.path.join(DATA_DIR, "mangaluru_demand_daily.csv")
    demand_df.to_csv(demand_path, index=False)
    print(f" -> Saved {len(demand_df)} rows to {demand_path}")

    # Step 5: NRW
    print("Generating Non-Revenue Water Daily...")
    nrw_df = generate_nrw_daily(demand_df)
    nrw_path = os.path.join(DATA_DIR, "mangaluru_nrw_daily.csv")
    nrw_df.to_csv(nrw_path, index=False)
    print(f" -> Saved {len(nrw_df)} rows to {nrw_path}")

    # Step 6: Event Log
    print("Generating Operational Event Log...")
    evt_df = generate_event_log()
    evt_path = os.path.join(DATA_DIR, "mangaluru_event_log.csv")
    evt_df.to_csv(evt_path, index=False)
    print(f" -> Saved {len(evt_df)} rows to {evt_path}")

    # Step 7: Master Dataset
    print("Synthesizing Master Dataset with WSI and 5-Level Crisis Classification...")
    master_df = generate_master_dataset(res_df, climate_df, gw_df, demand_df, nrw_df)
    master_path = os.path.join(DATA_DIR, "mangaluru_master_dataset.csv")
    master_df.to_csv(master_path, index=False)
    print(f" -> Saved {len(master_df)} rows to {master_path}")

    print("-" * 70)
    print("DATASET VALIDATION SUMMARY:")
    print(f"Total Master Records: {len(master_df)} (Target was 5,848: {NUM_DAYS} days * 8 areas)")
    print("Crisis Level Distribution:")
    counts = master_df["crisis_level"].value_counts().sort_index()
    labels = ["Level 0 (No Crisis)", "Level 1 (Minor Stress)", "Level 2 (Moderate Crisis)", "Level 3 (High Crisis)", "Level 4 (Critical Crisis)"]
    for lvl, cnt in counts.items():
        pct = (cnt / len(master_df)) * 100.0
        print(f"  {labels[lvl]}: {cnt:5d} ({pct:5.2f}%)")
    print(f"Average WSI: {master_df['water_security_index'].mean():.3f} (Min: {master_df['water_security_index'].min():.3f}, Max: {master_df['water_security_index'].max():.3f})")
    print("=" * 70)

if __name__ == "__main__":
    main()
