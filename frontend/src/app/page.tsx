"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchOverview,
  fetchAreas,
  fetchAlerts,
  acknowledgeAlert
} from "@/lib/api";
import {
  Droplets,
  AlertTriangle,
  TrendingDown,
  CloudRain,
  ShieldAlert,
  ArrowRight,
  Activity,
  Layers,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from "recharts";

export default function OverviewPage() {
  const [overview, setOverview] = useState<any>(null);
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [ovData, areasData] = await Promise.all([
        fetchOverview(),
        fetchAreas()
      ]);
      setOverview(ovData);
      setAreas(areasData.service_areas || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    await acknowledgeAlert(alertId, "MCC Duty Officer");
    await loadData();
  };

  if (loading || !overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-slate-600 font-medium text-sm">Loading Mangaluru Water Intelligence System...</p>
      </div>
    );
  }

  // Distribution chart data
  const dist = overview.risk_distribution || {};
  const riskChartData = [
    { name: "No Crisis", count: dist.level_0_no_crisis || 0, color: "#10b981", level: 0 },
    { name: "Minor Stress", count: dist.level_1_minor_stress || 0, color: "#06b6d4", level: 1 },
    { name: "Moderate Crisis", count: dist.level_2_moderate_crisis || 0, color: "#f59e0b", level: 2 },
    { name: "High Crisis", count: dist.level_3_high_crisis || 0, color: "#f97316", level: 3 },
    { name: "Critical Crisis", count: dist.level_4_critical_crisis || 0, color: "#ef4444", level: 4 },
  ];

  const wsi = overview.water_security_index || 0.5;
  const wsiPct = Math.round(wsi * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner / System Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              Live Forecast Active
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Simulation Date: {overview.simulation_as_of}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Mangaluru Urban Water Early Warning Portal
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Multi-source hydro-meteorological surveillance for 8 demonstration service areas in Dakshina Kannada.
            Integrating Netravati and Gurupura river basin indicators with AI multi-horizon predictions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setRefreshing(true); loadData(); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/predictions"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-md shadow-sky-600/30 transition"
          >
            <span>View 14-Day Forecast</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: System Crisis Status */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Current City Status</span>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="my-3">
            <div className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                overview.status_color === "red" ? "bg-red-500 animate-ping" :
                overview.status_color === "orange" ? "bg-orange-500" :
                overview.status_color === "amber" ? "bg-amber-500" :
                overview.status_color === "blue" ? "bg-sky-500" : "bg-emerald-500"
              }`} />
              {overview.overall_status}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {overview.active_alerts_count} active alert(s) requiring response
            </p>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
            <span>Target Severity Threshold</span>
            <span className="font-semibold text-slate-700">Multi-Factor Score</span>
          </div>
        </div>

        {/* Card 2: Composite WSI */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Water Security Index (WSI)</span>
            <ShieldAlert className="w-4 h-4 text-teal-600" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{wsi.toFixed(3)}</span>
              <span className="text-xs font-medium text-slate-500">/ 1.000</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  wsiPct < 30 ? "bg-red-500" : wsiPct < 50 ? "bg-amber-500" : wsiPct < 70 ? "bg-sky-500" : "bg-emerald-500"
                }`}
                style={{ width: `${wsiPct}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
            <span>Range: 0 (Crisis) – 1 (Abundant)</span>
            <span className="font-semibold text-teal-700">{wsiPct}% Capacity</span>
          </div>
        </div>

        {/* Card 3: Storage Fill */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Storage Volume</span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{overview.reservoir_fill_percentage}%</span>
              <span className="text-xs font-medium text-slate-500">
                ({overview.total_storage_mcm} / {overview.total_capacity_mcm} MCM)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full"
                style={{ width: `${overview.reservoir_fill_percentage}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
            <span>Thumbe & AMR Network</span>
            <span className="font-semibold text-slate-700">4 Synthetic Nodes</span>
          </div>
        </div>

        {/* Card 4: Demand vs Supply Gap */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Demand-Supply Gap</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600">{overview.demand_supply_gap_mld}</span>
              <span className="text-xs font-medium text-slate-500">MLD Deficit</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Demand: {overview.total_water_demand_mld} MLD | Supply: {overview.total_water_supply_mld} MLD
            </p>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
            <span>Coverage Ratio</span>
            <span className="font-semibold text-slate-700">
              {((overview.total_water_supply_mld / overview.total_water_demand_mld) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Area Risk Distribution & Climate / Rainfall Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Risk Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Service Area Risk Classification Distribution
              </h2>
              <p className="text-xs text-slate-500">
                Current classification across the 8 demonstration areas in Mangaluru
              </p>
            </div>
            <Link
              href="/map"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Interactive Map <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Areas`, "Count"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-5 gap-2 mt-2 pt-3 border-t border-slate-100 text-center">
            {riskChartData.map((r) => (
              <div key={r.name} className="p-1 rounded bg-slate-50">
                <div className="text-[10px] text-slate-500 font-medium truncate">{r.name}</div>
                <div className="text-sm font-bold" style={{ color: r.color }}>{r.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Climate & Hydro Summary */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Coastal Climate Signals</h2>
              <CloudRain className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Arabian Sea Coastal Plain & Catchment Status
            </p>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Seasonal Period</div>
                  <div className="text-sm font-bold text-slate-800">{overview.climate_summary.season}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  overview.climate_summary.monsoon_active ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-700"
                }`}>
                  {overview.climate_summary.monsoon_active ? "SW Monsoon Active" : "Dry / Non-Monsoon"}
                </span>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">7-Day Rainfall Total</div>
                  <div className="text-sm font-bold text-slate-800">{overview.climate_summary.weekly_rainfall_mm} mm</div>
                </div>
                <span className="text-xs text-slate-500">Mangaluru Catchment</span>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Citizen Shortage Reports</div>
                  <div className="text-sm font-bold text-slate-800">{overview.pending_reports_count} Pending Review</div>
                </div>
                <Link
                  href="/report"
                  className="text-xs text-sky-600 font-medium hover:underline"
                >
                  Moderate
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/monitoring"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <span>Explore Resource Monitoring</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Demonstration Service Areas Quick Grid */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Demonstration Service Areas Status
            </h2>
            <p className="text-xs text-slate-500">
              Live hydrological vulnerability and supply metrics across Mangaluru's 8 service areas
            </p>
          </div>
          <Link
            href="/map"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            Open Map View <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {areas.map((area: any) => (
            <div
              key={area.code}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-sky-300 hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {area.code}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-1 group-hover:text-sky-600 transition-colors">
                    {area.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{area.area_type}</p>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: area.marker_color }}
                >
                  {area.crisis_label}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pop:</span>
                  <span className="font-medium text-slate-700">{area.population.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">WSI:</span>
                  <span className="font-medium text-slate-700">{area.current_wsi.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deficit:</span>
                  <span className={`font-semibold ${area.current_gap_mld > 0.5 ? "text-rose-600" : "text-emerald-600"}`}>
                    {area.current_gap_mld} MLD
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 text-right">
                <Link
                  href={`/predictions?area=${area.code}`}
                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-800 flex items-center justify-end gap-1"
                >
                  AI Forecast <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Active Alerts Section */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Active Operational & Early Warning Alerts
              </h2>
              <p className="text-xs text-slate-500">
                Automated threshold breaches and model-predicted crisis alerts
              </p>
            </div>
          </div>
          <Link
            href="/alerts"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            Manage All Alerts <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {overview.latest_alerts && overview.latest_alerts.length > 0 ? (
          <div className="space-y-3">
            {overview.latest_alerts.map((alt: any) => (
              <div
                key={alt.alert_id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  alt.severity === "CRITICAL"
                    ? "bg-red-50/60 border-red-200"
                    : alt.severity === "HIGH"
                    ? "bg-orange-50/60 border-orange-200"
                    : "bg-amber-50/60 border-amber-200"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-white ${
                      alt.severity === "CRITICAL" ? "bg-red-600" :
                      alt.severity === "HIGH" ? "bg-orange-500" : "bg-amber-500"
                    }`}>
                      {alt.severity}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{alt.title}</span>
                    <span className="text-xs text-slate-500">({alt.area_name || alt.area_code})</span>
                  </div>
                  <p className="text-xs text-slate-600">{alt.reason}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAcknowledge(alt.alert_id)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 transition shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Acknowledge
                  </button>
                  <Link
                    href="/alerts"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition shadow-sm"
                  >
                    Action
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            No active crisis alerts at this time. All systems within standard operational bounds.
          </div>
        )}
      </div>
    </div>
  );
}
