# MANGALURU SYNTHETIC HYDROLOGICAL & OPERATIONAL DATASET

> **IMPORTANT LEGAL & SCIENTIFIC NOTICE**:
> **ALL DATA IN THIS DIRECTORY IS SYNTHETIC / SIMULATED RESEARCH DATA GENERATED FOR SCIENTIFIC PROTOTYPING AND EDUCATIONAL DEMONSTRATION PURPOSES.**
> **NEVER CLAIM OR INTERPRET THESE RECORDS AS OFFICIAL, REAL-TIME, OR HISTORICALLY RECORDED MEASUREMENTS BY THE MANGALURU CITY CORPORATION (MCC), KARNATAKA URBAN WATER SUPPLY AND DRAINAGE BOARD (KUWSDB), CENTRAL GROUND WATER BOARD (CGWB), OR INDIA METEOROLOGICAL DEPARTMENT (IMD).**

---

## 1. Overview and Geographical Focus

This dataset has been synthesized specifically for the coastal city of **Mangaluru (Dakshina Kannada district, Karnataka, India)** for the simulation period **2023-01-01 to 2024-12-31** (731 consecutive days, leap year 2024 included).

Mangaluru possesses unique coastal hydrological dynamics distinctly different from inland plateau regions:
1. **Tropical Monsoon Climate (Am)**: Average annual rainfall of ~3,500 mm to 4,000 mm, with over 80% concentrated in the Southwest Monsoon (June through September).
2. **Rapid Coastal River Hydrodynamics**: Surface water originates from the Western Ghats flowing through the **Netravati** and **Gurupura (Phalguni)** rivers into the Arabian Sea. Inflows peak rapidly during monsoon downpours and recede sharply during the summer dry season.
3. **Severe Pre-Monsoon Summer Scarcity (March–May)**: Despite heavy monsoon rainfall, high evapotranspiration, steep lateritic topography, and low baseflows create severe water stress in April and May before monsoon onset.
4. **Coastal Aquifer Saline Ingress Risk**: Over-abstraction of groundwater during dry summer months exposes low-lying estuarine zones (e.g. Ullal, Surathkal) to saltwater intrusion.

---

## 2. Demonstration Service Areas

Eight demonstration service areas in Mangaluru are modeled (treated as analytical demonstration zones, not claims of official administrative wards):

| Code | Service Area Name | Characteristic / Vulnerability Profile | Population | Base LPCD |
|------|-------------------|-----------------------------------------|------------|-----------|
| `HAM` | Hampankatta | Central Commercial & Transit Hub (railway station, high commercial daytime load) | 42,000 | 155 |
| `KAD` | Kadri | Hilly Laterite Plateau (Kadri Manjunatha temple, elevation pressure drops) | 68,000 | 145 |
| `BEJ` | Bejai | Transit & Commercial Corridor (KSRTC hub, dense urban residential) | 58,000 | 150 |
| `KAN` | Kankanady | Healthcare Corridor (major multi-specialty hospitals, non-interruptible demand) | 52,000 | 160 |
| `BEN` | Bendoor | Educational & Residential Zone (St. Agnes, Balmatta fringe, stable piped grid) | 48,000 | 140 |
| `URW` | Urwa | Low-lying Coastal-Adjacent Market & Residential (near Sultan Battery) | 44,000 | 142 |
| `SUR` | Surathkal | Northern Industrial & Academic Zone (NITK, Baikampady edge, high institutional draw) | 76,000 | 152 |
| `ULL` | Ullal | Southern Estuary & Coastal Habitation (Netravati mouth, saline intrusion risk) | 62,000 | 138 |

---

## 3. Synthetic Water Sources & Infrastructure Nodes

Four synthetic intake and balancing storage nodes represent the municipal supply infrastructure:

| Source ID | Synthetic Source Description | River Basin / Aquifer | Capacity (MCM) |
|-----------|------------------------------|-----------------------|----------------|
| `SRC-THUMBE` | Thumbe Vented Dam Intake (Synthetic S1) | Netravati River | 14.73 |
| `SRC-AMR` | AMR Vent-Dam Balancing Storage (Synthetic S2) | Netravati River (Upstream) | 10.25 |
| `SRC-GURUPURA` | Gurupura Basin Intake Station (Synthetic S3) | Phalguni River | 6.50 |
| `SRC-WELLS` | Municipal Infiltration & Borewell Battery (Synthetic S4) | Coastal Alluvial Aquifer | 3.80 |
| **TOTAL** | **Combined Urban Demonstration Capacity** | | **35.28 MCM** |

---

## 4. Generated File Schemas & Units of Measurement

### File 1: `mangaluru_climate_daily.csv` (5,848 rows)
- `measurement_date` (YYYY-MM-DD): Date of record.
- `location_code` (string): Demonstration service area code (HAM, KAD, etc.).
- `temperature_min` (Celsius): Daily minimum temperature.
- `temperature_max` (Celsius): Daily maximum temperature.
- `temperature_avg` (Celsius): Daily mean temperature.
- `rainfall_mm` (millimeters): 24-hour recorded rainfall.
- `humidity` (percentage %): Mean relative humidity.
- `monsoon_indicator` (integer: 0 or 1): 1 for Southwest Monsoon (June 1 – Sept 30).
- `seasonal_indicator` (string): Winter, Summer, Monsoon, Post-Monsoon.

### File 2: `mangaluru_reservoir_daily.csv` (2,924 rows: 731 days × 4 sources)
- `measurement_date` (YYYY-MM-DD): Date of record.
- `source_id` (string): Synthetic identifier (`SRC-THUMBE`, `SRC-AMR`, etc.).
- `source_name` (string): Descriptive label.
- `location_code` (string): Hydraulic station code.
- `storage_capacity_mcm` (Million Cubic Meters): Maximum retention volume.
- `storage_level_mcm` (MCM): End-of-day retained volume.
- `storage_percentage` (percentage %): $\frac{\text{Storage Level}}{\text{Capacity}} \times 100$.
- `inflow_mcm` (MCM/day): Daily river/catchment inflow.
- `outflow_mcm` (MCM/day): Daily municipal abstraction + spillway discharge.
- `storage_change_rate` (MCM/day): Net change ($V_t - V_{t-1}$).
- `water_availability_status` (string): Optimal, Adequate, Depleting, Stressed, Critical.

### File 3: `mangaluru_groundwater_daily.csv` (5,848 rows)
- `measurement_date` (YYYY-MM-DD): Date of observation.
- `location_code` (string): Demonstration service area.
- `groundwater_level` (meters): Depth to static water table below ground level (m bgl).
- `groundwater_drawdown` (meters): Drawdown relative to post-monsoon static level.
- `groundwater_recharge` (meters/day): Daily vertical percolation recharge from rainfall.
- `groundwater_pumping_rate` (MLD): Estimated daily extraction volume in zone.
- `groundwater_stress_index` (0.0 to 1.0): Aquifer stress ratio.

### File 4: `mangaluru_demand_daily.csv` (5,848 rows)
- `measurement_date` (YYYY-MM-DD): Date of observation.
- `location_code` (string): Demonstration service area.
- `population_estimate` (integer): Serviced resident and floating population.
- `daily_water_demand_mld` (MLD - Million Litres per Day): Theoretical demand.
- `daily_water_supply_mld` (MLD): Actual piped water supplied by municipal works.
- `demand_supply_gap_mld` (MLD): Deficit ($Demand - Supply$).
- `water_consumption_per_capita` (Litres per Capita per Day - LPCD): Actual per capita supply.
- `supply_coverage_percentage` (percentage %): $\frac{\text{Supply}}{\text{Demand}} \times 100$.
- `days_of_supply_remaining` (days): Theoretical storage exhaustion horizon.

### File 5: `mangaluru_nrw_daily.csv` (5,848 rows)
- `measurement_date` (YYYY-MM-DD): Date of observation.
- `location_code` (string): Demonstration service area.
- `total_water_input_mld` (MLD): Bulk water delivered into distribution district metered area.
- `billed_water_mld` (MLD): Revenue water delivered to consumers.
- `estimated_water_loss_mld` (MLD): Physical leaks, bursts, unauthorized extraction.
- `nrw_percentage` (percentage %): Non-Revenue Water ratio.

### File 6: `mangaluru_event_log.csv` (~150 records)
- `event_id` (string): Unique identifier (e.g., `EVT-MNG-1001`).
- `event_date` (YYYY-MM-DD): Date of incident.
- `location_code` (string): Affected demonstration service area.
- `event_type` (string): Water shortage, Pipeline leakage, Water contamination, Pump failure, Heavy rainfall, Emergency water distribution.
- `severity` (string): Low, Moderate, High, Critical.
- `description` (string): Narrative contextual log.
- `event_status` (string): Active, Under Review, Investigating, Resolved.

### File 7: `mangaluru_master_dataset.csv` (5,848 rows)
Unified daily table consolidating all variables per service area for machine learning modeling, including:
- `water_security_index` (WSI: 0.0 to 1.0)
- `crisis_level` (0 to 4)
- `crisis_label` (NO CRISIS, MINOR STRESS, MODERATE CRISIS, HIGH CRISIS, CRITICAL CRISIS)

---

## 5. Water Security Index (WSI) Formulation

Following the multi-attribute formulation:
$$WSI = w_1 S_p + w_2 R + w_3 I - w_4 D - w_5 G_d$$

Where:
- $S_p$: Normalized system storage percentage ($0.0 \le S_p \le 1.0$)
- $R$: Normalized 24h rainfall
- $I$: Normalized river inflow
- $D$: Normalized daily water demand
- $G_d$: Normalized groundwater depletion index

Higher WSI values indicate healthy water reserves, abundant streamflow, and minimal stress; lower WSI values signify escalating urban water deficits and critical drought vulnerability.

---

## 6. How to Regenerate Data

To regenerate this dataset with identical, deterministic values:
```bash
python data_generator.py
```
Random seed `42` ensures exact bit-level reproducibility across operating systems.
