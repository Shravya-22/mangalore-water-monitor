"use client";

import React, { useEffect, useState } from "react";
import { fetchAlerts, acknowledgeAlert, resolveAlert } from "@/lib/api";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Clock,
  Filter,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Search,
  Check
} from "lucide-react";

export default function AlertManagementPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actingAlertId, setActingAlertId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchAlerts(statusFilter, severityFilter);
      setAlerts(res.alerts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, severityFilter]);

  const handleAcknowledge = async (id: string) => {
    setActingAlertId(id);
    await acknowledgeAlert(id, "MCC Executive Engineer");
    await loadData();
    setActingAlertId(null);
  };

  const handleResolve = async (id: string) => {
    setActingAlertId(id);
    await resolveAlert(id);
    await loadData();
    setActingAlertId(null);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.alert_id.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      (a.area_name || "").toLowerCase().includes(q) ||
      a.reason.toLowerCase().includes(q)
    );
  });

  const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;
  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL" && a.status !== "RESOLVED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              Early Warning & Incident Response
            </span>
            <span className="text-xs text-slate-500">
              Rule-Based & ML Predicted Alerts
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Water Crisis Alert Operations Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated alerts triggered on storage exhaustion, aquifer drawdown, and AI crisis forecasts.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="font-bold text-red-900">{criticalCount} Critical</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-bold text-amber-900">{activeCount} Total Active</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, title, area, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="ELEVATED">Elevated</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Feed List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl p-12 border border-slate-200 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
            <p className="text-xs text-slate-500">Loading alerts queue...</p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alt) => (
            <div
              key={alt.alert_id}
              className={`bg-white rounded-xl p-5 border shadow-sm transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                alt.status === "RESOLVED"
                  ? "border-slate-200 opacity-75 bg-slate-50/50"
                  : alt.severity === "CRITICAL"
                  ? "border-red-300 bg-red-50/30"
                  : alt.severity === "HIGH"
                  ? "border-orange-300 bg-orange-50/30"
                  : "border-slate-200"
              }`}
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {alt.alert_id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${
                    alt.severity === "CRITICAL" ? "bg-red-600" :
                    alt.severity === "HIGH" ? "bg-orange-500" :
                    alt.severity === "MODERATE" ? "bg-amber-500" : "bg-sky-600"
                  }`}>
                    {alt.severity}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    alt.status === "ACTIVE" ? "bg-amber-100 text-amber-900 border border-amber-300" :
                    alt.status === "ACKNOWLEDGED" ? "bg-blue-100 text-blue-900 border border-blue-300" :
                    "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  }`}>
                    {alt.status}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {alt.alert_date}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    Location: {alt.area_name || alt.area_code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {alt.title}
                </h3>

                <p className="text-xs text-slate-600">
                  <strong className="text-slate-800">Trigger Reason:</strong> {alt.reason}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-100/80 border border-slate-200/60 text-xs text-slate-700 mt-2">
                  <strong className="text-slate-900 flex items-center gap-1.5 mb-0.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-sky-600" /> Recommended Administrative Action:
                  </strong>
                  <span>{alt.recommended_action}</span>
                </div>

                {alt.acknowledged_by && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    Acknowledged by: <strong>{alt.acknowledged_by}</strong> at {alt.acknowledged_at}
                  </div>
                )}
                {alt.resolved_at && (
                  <div className="text-[11px] text-emerald-600">
                    Resolved at: {alt.resolved_at}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col items-center gap-2 shrink-0 w-full md:w-36">
                {alt.status === "ACTIVE" && (
                  <button
                    disabled={actingAlertId === alt.alert_id}
                    onClick={() => handleAcknowledge(alt.alert_id)}
                    className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Acknowledge
                  </button>
                )}

                {alt.status !== "RESOLVED" && (
                  <button
                    disabled={actingAlertId === alt.alert_id}
                    onClick={() => handleResolve(alt.alert_id)}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolve Alert
                  </button>
                )}

                {alt.status === "RESOLVED" && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Closed Out
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-12 border border-slate-200 text-center text-slate-400 text-xs">
            No alerts found matching the selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
