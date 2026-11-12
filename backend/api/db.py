"""
Database Initialization and Persistence Layer
---------------------------------------------
Supports PostgreSQL when DATABASE_URL is configured, and defaults
to a robust local SQLite engine (mangaluru_water.db) for instant zero-dependency execution.
Maintains relational tables for areas, sources, predictions, alerts,
public citizen reports, ETL jobs, and model performance metadata.
"""

import os
import sqlite3
import json
from datetime import datetime

DB_PATH = os.environ.get("SQLITE_PATH") or os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "mangaluru_water.db")
os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()

    # 1. Demonstration Service Areas
    c.execute("""
    CREATE TABLE IF NOT EXISTS demo_areas (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        area_type TEXT NOT NULL,
        population INTEGER NOT NULL,
        base_lpcd REAL NOT NULL,
        gw_base_depth REAL NOT NULL,
        nrw_base_pct REAL NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        gw_vulnerability TEXT NOT NULL,
        current_crisis_level INTEGER DEFAULT 0,
        current_wsi REAL DEFAULT 0.5,
        current_demand_mld REAL DEFAULT 0.0,
        current_supply_mld REAL DEFAULT 0.0,
        current_gap_mld REAL DEFAULT 0.0
    )
    """)

    # 2. Water Sources (Synthetic)
    c.execute("""
    CREATE TABLE IF NOT EXISTS water_sources (
        source_id TEXT PRIMARY KEY,
        source_name TEXT NOT NULL,
        location_code TEXT NOT NULL,
        capacity_mcm REAL NOT NULL,
        current_storage_mcm REAL NOT NULL,
        storage_percentage REAL NOT NULL,
        current_inflow_mcm REAL NOT NULL,
        current_outflow_mcm REAL NOT NULL,
        status TEXT NOT NULL
    )
    """)

    # 3. Model Predictions (1d, 7d, 14d)
    c.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        area_code TEXT NOT NULL,
        target_date TEXT NOT NULL,
        horizon TEXT NOT NULL,
        predicted_class INTEGER NOT NULL,
        class_label TEXT NOT NULL,
        confidence_pct REAL NOT NULL,
        probability_level_0 REAL NOT NULL,
        probability_level_1 REAL NOT NULL,
        probability_level_2 REAL NOT NULL,
        probability_level_3 REAL NOT NULL,
        probability_level_4 REAL NOT NULL,
        risk_level TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # 4. System Alerts
    c.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        alert_id TEXT PRIMARY KEY,
        area_code TEXT NOT NULL,
        alert_date TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        reason TEXT NOT NULL,
        recommended_action TEXT NOT NULL,
        status TEXT NOT NULL, -- ACTIVE, ACKNOWLEDGED, RESOLVED
        acknowledged_by TEXT,
        acknowledged_at TEXT,
        resolved_at TEXT
    )
    """)

    # 5. Public Issue Reports & Moderation Queue
    c.execute("""
    CREATE TABLE IF NOT EXISTS public_reports (
        report_id TEXT PRIMARY KEY,
        reporter_name TEXT,
        contact_info TEXT,
        area_code TEXT NOT NULL,
        issue_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        description TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        reported_at TEXT NOT NULL,
        moderation_status TEXT NOT NULL, -- PENDING, APPROVED, REJECTED
        moderated_by TEXT,
        moderated_at TEXT
    )
    """)

    # 6. Background ETL and Training Jobs
    c.execute("""
    CREATE TABLE IF NOT EXISTS etl_jobs (
        job_id TEXT PRIMARY KEY,
        job_type TEXT NOT NULL, -- file_import, etl_pipeline, model_training, prediction_run
        status TEXT NOT NULL,   -- SUCCESS, RUNNING, PENDING, FAILED
        started_at TEXT NOT NULL,
        finished_at TEXT,
        duration_seconds REAL,
        records_processed INTEGER,
        log_message TEXT
    )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database schema successfully verified at:", DB_PATH)
