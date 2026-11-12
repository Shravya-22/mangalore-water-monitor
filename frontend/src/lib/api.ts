/**
 * Mangaluru Water Intelligence API Client
 * Connects to FastAPI backend with fallbacks for offline execution.
 */

// Reads environment variable or defaults to empty (same origin / rewrites) or localhost in dev
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

/**
 * Builds the complete URL for an API endpoint.
 * In development without NEXT_PUBLIC_API_URL, it routes to http://127.0.0.1:8000.
 * In production on Vercel, it routes to the deployed backend on Render.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE) {
    return `${API_BASE}${cleanPath}`;
  }
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return `http://127.0.0.1:8000${cleanPath}`;
  }
  return cleanPath;
}

export async function fetchOverview() {
  try {
    const res = await fetch(getApiUrl("/api/dashboard/overview"), { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (e) {
    console.warn("Using fallback overview data:", e);
    return {
      application_title: "MANGALURU WATER INTELLIGENCE",
      system_notice: "DEMO MODE – SYNTHETIC MANGALURU DATA",
      city: "Mangaluru, Karnataka, India",
      simulation_as_of: "2024-12-31",
      overall_status: "ELEVATED STRESS",
      status_color: "amber",
      water_security_index: 0.493,
      total_water_demand_mld: 124.8,
      total_water_supply_mld: 116.2,
      demand_supply_gap_mld: 8.6,
      reservoir_fill_percentage: 68.4,
      total_storage_mcm: 24.12,
      total_capacity_mcm: 35.28,
      active_alerts_count: 3,
      pending_reports_count: 2,
      climate_summary: {
        season: "Winter",
        monsoon_active: false,
        weekly_rainfall_mm: 1.4
      },
      risk_distribution: {
        level_0_no_crisis: 4,
        level_1_minor_stress: 2,
        level_2_moderate_crisis: 1,
        level_3_high_crisis: 1,
        level_4_critical_crisis: 0
      },
      latest_alerts: [
        {
          alert_id: "ALT-MNG-101",
          area_code: "ULL",
          area_name: "Ullal",
          alert_date: "2024-12-30",
          severity: "CRITICAL",
          title: "Aquifer Salinity Ingress Warning",
          reason: "Groundwater drawdown reached 14.8m near estuary with chloride level elevation",
          status: "ACTIVE"
        },
        {
          alert_id: "ALT-MNG-102",
          area_code: "KAD",
          area_name: "Kadri",
          alert_date: "2024-12-28",
          severity: "HIGH",
          title: "High-Elevation Distribution Pressure Deficit",
          reason: "Elevation head loss causing intermittent supply drop below 90 LPCD in Kadri Hills",
          status: "ACTIVE"
        }
      ]
    };
  }
}

export async function fetchAreas() {
  try {
    const res = await fetch(getApiUrl("/api/areas"), { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (e) {
    return {
      city: "Mangaluru, Karnataka",
      center: { lat: 12.8911, lng: 74.8488 },
      total_areas: 8,
      service_areas: [
        { code: "HAM", name: "Hampankatta", area_type: "Commercial & Transit Core", population: 42000, current_crisis_level: 1, crisis_label: "MINOR STRESS", current_wsi: 0.52, current_demand_mld: 6.51, current_supply_mld: 6.20, current_gap_mld: 0.31, lat: 12.8698, lng: 74.8430, marker_color: "#06b6d4", gw_vulnerability: "Medium" },
        { code: "KAD", name: "Kadri", area_type: "Hilly Residential & Pilgrimage", population: 68000, current_crisis_level: 2, crisis_label: "MODERATE CRISIS", current_wsi: 0.44, current_demand_mld: 9.86, current_supply_mld: 8.70, current_gap_mld: 1.16, lat: 12.8911, lng: 74.8624, marker_color: "#f59e0b", gw_vulnerability: "High" },
        { code: "BEJ", name: "Bejai", area_type: "Central Mixed Commercial & Hub", population: 58000, current_crisis_level: 1, crisis_label: "MINOR STRESS", current_wsi: 0.48, current_demand_mld: 8.70, current_supply_mld: 8.10, current_gap_mld: 0.60, lat: 12.8856, lng: 74.8488, marker_color: "#06b6d4", gw_vulnerability: "Medium" },
        { code: "KAN", name: "Kankanady", area_type: "Healthcare Corridor", population: 52000, current_crisis_level: 0, crisis_label: "NO CRISIS", current_wsi: 0.61, current_demand_mld: 8.32, current_supply_mld: 8.30, current_gap_mld: 0.02, lat: 12.8622, lng: 74.8617, marker_color: "#10b981", gw_vulnerability: "Low" },
        { code: "BEN", name: "Bendoor", area_type: "Educational & Residential", population: 48000, current_crisis_level: 0, crisis_label: "NO CRISIS", current_wsi: 0.64, current_demand_mld: 6.72, current_supply_mld: 6.70, current_gap_mld: 0.02, lat: 12.8765, lng: 74.8562, marker_color: "#10b981", gw_vulnerability: "Low" },
        { code: "URW", name: "Urwa", area_type: "Coastal-Adjacent Urban & Market", population: 44000, current_crisis_level: 0, crisis_label: "NO CRISIS", current_wsi: 0.58, current_demand_mld: 6.25, current_supply_mld: 6.20, current_gap_mld: 0.05, lat: 12.8985, lng: 74.8329, marker_color: "#10b981", gw_vulnerability: "Medium" },
        { code: "SUR", name: "Surathkal", area_type: "Northern Industrial & Academic Fringe", population: 76000, current_crisis_level: 1, crisis_label: "MINOR STRESS", current_wsi: 0.49, current_demand_mld: 11.55, current_supply_mld: 10.80, current_gap_mld: 0.75, lat: 13.0078, lng: 74.7937, marker_color: "#06b6d4", gw_vulnerability: "High" },
        { code: "ULL", name: "Ullal", area_type: "Southern Coastal Estuary", population: 62000, current_crisis_level: 3, crisis_label: "HIGH CRISIS", current_wsi: 0.33, current_demand_mld: 8.56, current_supply_mld: 6.90, current_gap_mld: 1.66, lat: 12.8056, lng: 74.8565, marker_color: "#f97316", gw_vulnerability: "Critical (Saline Risk)" }
      ]
    };
  }
}

export async function fetchPredictions(horizon = "7d", areaCode?: string) {
  try {
    const params = new URLSearchParams();
    params.set("horizon", horizon);
    if (areaCode) params.set("area_code", areaCode);
    const res = await fetch(getApiUrl(`/api/predictions?${params.toString()}`), { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (e) {
    console.warn("Using fallback predictions:", e);
    return {
      horizon,
      forecast_horizon_label: `Next ${horizon.replace("d", " Day(s)")}`,
      primary_model: "LightGBM Multi-Class Classifier",
      total_predictions: 8,
      top_contributing_features: [
        { feature: "storage_adequacy_days", importance: 342.0 },
        { feature: "demand_supply_gap_mld", importance: 298.0 },
        { feature: "days_of_supply_remaining", importance: 265.0 },
        { feature: "demand_supply_gap_mld_lag_14", importance: 210.0 },
        { feature: "water_security_index", importance: 195.0 }
      ],
      predictions: [
        { area_code: "ULL", area_name: "Ullal", horizon, predicted_class: 3, class_label: "HIGH CRISIS", confidence_pct: 94.2, risk_level: "HIGH", probability_level_0: 0.01, probability_level_1: 0.03, probability_level_2: 0.02, probability_level_3: 0.94, probability_level_4: 0.00 },
        { area_code: "KAD", area_name: "Kadri", horizon, predicted_class: 2, class_label: "MODERATE CRISIS", confidence_pct: 88.5, risk_level: "MODERATE", probability_level_0: 0.02, probability_level_1: 0.08, probability_level_2: 0.88, probability_level_3: 0.02, probability_level_4: 0.00 },
        { area_code: "SUR", area_name: "Surathkal", horizon, predicted_class: 1, class_label: "MINOR STRESS", confidence_pct: 91.0, risk_level: "ELEVATED", probability_level_0: 0.04, probability_level_1: 0.91, probability_level_2: 0.04, probability_level_3: 0.01, probability_level_4: 0.00 },
        { area_code: "BEJ", area_name: "Bejai", horizon, predicted_class: 1, class_label: "MINOR STRESS", confidence_pct: 93.4, risk_level: "ELEVATED", probability_level_0: 0.03, probability_level_1: 0.93, probability_level_2: 0.03, probability_level_3: 0.01, probability_level_4: 0.00 },
        { area_code: "HAM", area_name: "Hampankatta", horizon, predicted_class: 1, class_label: "MINOR STRESS", confidence_pct: 89.2, risk_level: "ELEVATED", probability_level_0: 0.05, probability_level_1: 0.89, probability_level_2: 0.05, probability_level_3: 0.01, probability_level_4: 0.00 },
        { area_code: "URW", area_name: "Urwa", horizon, predicted_class: 0, class_label: "NO CRISIS", confidence_pct: 96.8, risk_level: "NORMAL", probability_level_0: 0.97, probability_level_1: 0.02, probability_level_2: 0.01, probability_level_3: 0.00, probability_level_4: 0.00 },
        { area_code: "BEN", area_name: "Bendoor", horizon, predicted_class: 0, class_label: "NO CRISIS", confidence_pct: 97.4, risk_level: "NORMAL", probability_level_0: 0.97, probability_level_1: 0.02, probability_level_2: 0.01, probability_level_3: 0.00, probability_level_4: 0.00 },
        { area_code: "KAN", area_name: "Kankanady", horizon, predicted_class: 0, class_label: "NO CRISIS", confidence_pct: 98.2, risk_level: "NORMAL", probability_level_0: 0.98, probability_level_1: 0.01, probability_level_2: 0.01, probability_level_3: 0.00, probability_level_4: 0.00 }
      ]
    };
  }
}

export async function fetchWaterResources(locationCode?: string, days = 90) {
  try {
    const params = new URLSearchParams();
    params.set("days", days.toString());
    if (locationCode && locationCode !== "ALL") params.set("location_code", locationCode);
    const res = await fetch(getApiUrl(`/api/water-resources?${params.toString()}`), { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (e) {
    console.warn("Using fallback water resources data:", e);
    return {
      water_sources: [
        { source_id: "SRC-THUMBE", source_name: "Thumbe Vented Dam Intake (Netravati)", capacity_mcm: 14.73, current_storage_mcm: 10.35, storage_percentage: 70.3, status: "Adequate" },
        { source_id: "SRC-AMR", source_name: "AMR Vent-Dam Balancing Storage", capacity_mcm: 10.25, current_storage_mcm: 7.28, storage_percentage: 71.0, status: "Adequate" },
        { source_id: "SRC-GURUPURA", source_name: "Gurupura Basin Intake Station", capacity_mcm: 6.50, current_storage_mcm: 4.10, storage_percentage: 63.1, status: "Adequate" },
        { source_id: "SRC-WELLS", source_name: "Municipal Infiltration & Borewell Battery", capacity_mcm: 3.80, current_storage_mcm: 2.39, storage_percentage: 62.9, status: "Adequate" }
      ],
      timeline_data: []
    };
  }
}

export async function fetchAlerts(status = "ALL", severity = "ALL") {
  try {
    const params = new URLSearchParams();
    params.set("status", status);
    params.set("severity", severity);
    const res = await fetch(getApiUrl(`/api/alerts?${params.toString()}`), { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (e) {
    return { total_alerts: 0, alerts: [] };
  }
}

export async function acknowledgeAlert(alertId: string, officerName: string) {
  const res = await fetch(getApiUrl(`/api/alerts/${alertId}/acknowledge`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ officer_name: officerName })
  });
  return await res.json();
}

export async function resolveAlert(alertId: string) {
  const res = await fetch(getApiUrl(`/api/alerts/${alertId}/resolve`), {
    method: "POST"
  });
  return await res.json();
}

export async function submitReport(data: any) {
  const res = await fetch(getApiUrl("/api/reports"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function fetchReports(status = "ALL") {
  const res = await fetch(getApiUrl(`/api/reports?moderation_status=${status}`), { cache: "no-store" });
  return await res.json();
}

export async function moderateReport(reportId: string, status: "APPROVED" | "REJECTED") {
  const res = await fetch(getApiUrl(`/api/reports/${reportId}/moderate`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return await res.json();
}

export async function fetchModelPerformance() {
  try {
    const res = await fetch(getApiUrl("/api/model/performance"), { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (e) {
    console.warn("Using fallback model performance:", e);
    return null;
  }
}

export async function triggerEtlPipeline() {
  const res = await fetch(getApiUrl("/api/admin/run-etl"), { method: "POST" });
  return await res.json();
}

export async function triggerModelTraining() {
  const res = await fetch(getApiUrl("/api/admin/train-model"), { method: "POST" });
  return await res.json();
}

export async function fetchJobs() {
  const res = await fetch(getApiUrl("/api/admin/jobs"), { cache: "no-store" });
  return await res.json();
}

export async function uploadDatasetFile(formData: FormData) {
  const res = await fetch(getApiUrl("/api/admin/upload"), {
    method: "POST",
    body: formData,
  });
  return await res.json();
}

