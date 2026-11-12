-- =============================================================================
-- MANGALURU WATER INTELLIGENCE - POSTGRESQL PRODUCTION DATABASE SCHEMA
-- AI-Powered Urban Water Crisis Forecasting & Monitoring System
-- Target Geography: Mangaluru, Dakshina Kannada, Karnataka, India
-- =============================================================================

-- 1. Demonstration Service Areas
CREATE TABLE IF NOT EXISTS demo_areas (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    area_type VARCHAR(100) NOT NULL,
    population INTEGER NOT NULL,
    base_lpcd NUMERIC(6, 2) NOT NULL,
    gw_base_depth NUMERIC(6, 2) NOT NULL,
    nrw_base_pct NUMERIC(5, 2) NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    gw_vulnerability VARCHAR(100) NOT NULL,
    current_crisis_level INTEGER DEFAULT 0,
    current_wsi NUMERIC(5, 3) DEFAULT 0.500,
    current_demand_mld NUMERIC(8, 2) DEFAULT 0.00,
    current_supply_mld NUMERIC(8, 2) DEFAULT 0.00,
    current_gap_mld NUMERIC(8, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Synthetic Water Intake & Balancing Sources
CREATE TABLE IF NOT EXISTS water_sources (
    source_id VARCHAR(30) PRIMARY KEY,
    source_name VARCHAR(150) NOT NULL,
    location_code VARCHAR(50) NOT NULL,
    capacity_mcm NUMERIC(8, 2) NOT NULL,
    current_storage_mcm NUMERIC(8, 3) NOT NULL,
    storage_percentage NUMERIC(5, 2) NOT NULL,
    current_inflow_mcm NUMERIC(8, 3) NOT NULL,
    current_outflow_mcm NUMERIC(8, 3) NOT NULL,
    status VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Daily Reservoir Telemetry Records
CREATE TABLE IF NOT EXISTS reservoir_daily (
    id BIGSERIAL PRIMARY KEY,
    measurement_date DATE NOT NULL,
    source_id VARCHAR(30) REFERENCES water_sources(source_id),
    storage_capacity_mcm NUMERIC(8, 2) NOT NULL,
    storage_level_mcm NUMERIC(8, 3) NOT NULL,
    storage_percentage NUMERIC(5, 2) NOT NULL,
    inflow_mcm NUMERIC(8, 3) NOT NULL,
    outflow_mcm NUMERIC(8, 3) NOT NULL,
    storage_change_rate NUMERIC(8, 4) NOT NULL,
    water_availability_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_res_date_source UNIQUE (measurement_date, source_id)
);
CREATE INDEX idx_res_date ON reservoir_daily(measurement_date);

-- 4. Daily Climate & Precipitation Records
CREATE TABLE IF NOT EXISTS climate_daily (
    id BIGSERIAL PRIMARY KEY,
    measurement_date DATE NOT NULL,
    location_code VARCHAR(10) REFERENCES demo_areas(code),
    temperature_min NUMERIC(5, 2) NOT NULL,
    temperature_max NUMERIC(5, 2) NOT NULL,
    temperature_avg NUMERIC(5, 2) NOT NULL,
    rainfall_mm NUMERIC(7, 2) NOT NULL,
    humidity NUMERIC(5, 2) NOT NULL,
    monsoon_indicator SMALLINT NOT NULL,
    seasonal_indicator VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_clim_date_loc UNIQUE (measurement_date, location_code)
);
CREATE INDEX idx_clim_date ON climate_daily(measurement_date);

-- 5. Daily Groundwater Aquifer Observations
CREATE TABLE IF NOT EXISTS groundwater_daily (
    id BIGSERIAL PRIMARY KEY,
    measurement_date DATE NOT NULL,
    location_code VARCHAR(10) REFERENCES demo_areas(code),
    groundwater_level NUMERIC(6, 2) NOT NULL,
    groundwater_drawdown NUMERIC(6, 2) NOT NULL,
    groundwater_recharge NUMERIC(6, 3) NOT NULL,
    groundwater_pumping_rate NUMERIC(8, 2) NOT NULL,
    groundwater_stress_index NUMERIC(5, 3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_gw_date_loc UNIQUE (measurement_date, location_code)
);
CREATE INDEX idx_gw_date ON groundwater_daily(measurement_date);

-- 6. Daily Urban Water Demand & Municipal Supply
CREATE TABLE IF NOT EXISTS demand_daily (
    id BIGSERIAL PRIMARY KEY,
    measurement_date DATE NOT NULL,
    location_code VARCHAR(10) REFERENCES demo_areas(code),
    population_estimate INTEGER NOT NULL,
    daily_water_demand_mld NUMERIC(8, 2) NOT NULL,
    daily_water_supply_mld NUMERIC(8, 2) NOT NULL,
    demand_supply_gap_mld NUMERIC(8, 2) NOT NULL,
    water_consumption_per_capita NUMERIC(6, 2) NOT NULL,
    supply_coverage_percentage NUMERIC(5, 2) NOT NULL,
    days_of_supply_remaining NUMERIC(6, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_dem_date_loc UNIQUE (measurement_date, location_code)
);
CREATE INDEX idx_dem_date ON demand_daily(measurement_date);

-- 7. Non-Revenue Water (NRW) Daily Records
CREATE TABLE IF NOT EXISTS nrw_daily (
    id BIGSERIAL PRIMARY KEY,
    measurement_date DATE NOT NULL,
    location_code VARCHAR(10) REFERENCES demo_areas(code),
    total_water_input_mld NUMERIC(8, 2) NOT NULL,
    billed_water_mld NUMERIC(8, 2) NOT NULL,
    estimated_water_loss_mld NUMERIC(8, 2) NOT NULL,
    nrw_percentage NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_nrw_date_loc UNIQUE (measurement_date, location_code)
);

-- 8. Multi-Horizon Predictions
CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    area_code VARCHAR(10) REFERENCES demo_areas(code),
    target_date DATE NOT NULL,
    horizon VARCHAR(5) NOT NULL, -- 1d, 7d, 14d
    predicted_class SMALLINT NOT NULL,
    class_label VARCHAR(50) NOT NULL,
    confidence_pct NUMERIC(5, 2) NOT NULL,
    probability_level_0 NUMERIC(5, 4) NOT NULL,
    probability_level_1 NUMERIC(5, 4) NOT NULL,
    probability_level_2 NUMERIC(5, 4) NOT NULL,
    probability_level_3 NUMERIC(5, 4) NOT NULL,
    probability_level_4 NUMERIC(5, 4) NOT NULL,
    risk_level VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_pred_area_horizon ON predictions(area_code, horizon);

-- 9. Early Warning Alerts
CREATE TABLE IF NOT EXISTS alerts (
    alert_id VARCHAR(30) PRIMARY KEY,
    area_code VARCHAR(10) REFERENCES demo_areas(code),
    alert_date DATE NOT NULL,
    severity VARCHAR(20) NOT NULL, -- LOW, MODERATE, HIGH, CRITICAL
    title VARCHAR(150) NOT NULL,
    reason TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    status VARCHAR(20) NOT NULL, -- ACTIVE, ACKNOWLEDGED, RESOLVED
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_alerts_status ON alerts(status, severity);

-- 10. Public Citizen Reports & Moderation
CREATE TABLE IF NOT EXISTS public_reports (
    report_id VARCHAR(30) PRIMARY KEY,
    reporter_name VARCHAR(100),
    contact_info VARCHAR(100),
    area_code VARCHAR(10) REFERENCES demo_areas(code),
    issue_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    reported_at TIMESTAMP WITH TIME ZONE NOT NULL,
    moderation_status VARCHAR(20) NOT NULL, -- PENDING, APPROVED, REJECTED
    moderated_by VARCHAR(100),
    moderated_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_reports_status ON public_reports(moderation_status);

-- 11. ETL and MLOps Background Job Audit
CREATE TABLE IF NOT EXISTS etl_jobs (
    job_id VARCHAR(30) PRIMARY KEY,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- SUCCESS, RUNNING, PENDING, FAILED
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    duration_seconds NUMERIC(8, 2),
    records_processed INTEGER,
    log_message TEXT
);
