"use client";

import React, { useEffect, useState } from "react";
import { submitReport, fetchReports, moderateReport, fetchAreas } from "@/lib/api";
import {
  MessageSquarePlus,
  Send,
  CheckCircle,
  AlertCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  User,
  Phone,
  FileText
} from "lucide-react";

export default function PublicReportPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [moderationFilter, setModerationFilter] = useState<string>("ALL");
  const [loadingReports, setLoadingReports] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [areaCode, setAreaCode] = useState("HAM");
  const [issueType, setIssueType] = useState("Water shortage");
  const [severity, setSeverity] = useState("Moderate");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        const [aData, rData] = await Promise.all([
          fetchAreas(),
          fetchReports(moderationFilter)
        ]);
        setAreas(aData.service_areas || []);
        setReports(rData.reports || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingReports(false);
      }
    }
    load();
  }, [moderationFilter]);

  // When area changes, update suggested coordinates
  const handleAreaSelect = (code: string) => {
    setAreaCode(code);
    const matched = areas.find((a) => a.code === code);
    if (matched) {
      setLat(matched.lat.toString());
      setLng(matched.lng.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || description.trim().length < 5) {
      alert("Please enter a detailed description of the water problem.");
      return;
    }

    setSubmitting(true);
    setSubmitSuccess(null);

    try {
      const res = await submitReport({
        reporter_name: name.trim() || "Anonymous Citizen",
        contact_info: contact.trim() || undefined,
        area_code: areaCode,
        issue_type: issueType,
        severity: severity,
        description: description.trim(),
        latitude: lat ? parseFloat(lat) : undefined,
        longitude: lng ? parseFloat(lng) : undefined
      });

      setSubmitSuccess(`Report submitted successfully! Ticket ID: ${res.report_id}. Your report has entered the municipal moderation queue.`);
      setDescription("");
      setName("");
      setContact("");

      // Refresh list
      const rData = await fetchReports(moderationFilter);
      setReports(rData.reports || []);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleModerate = async (reportId: string, status: "APPROVED" | "REJECTED") => {
    await moderateReport(reportId, status);
    const rData = await fetchReports(moderationFilter);
    setReports(rData.reports || []);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase flex items-center gap-1">
              <MessageSquarePlus className="w-3.5 h-3.5" />
              Citizen Engagement & Crowdsourced Ground Truth
            </span>
            <span className="text-xs text-slate-500">
              Community Water Problem Reporting
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Report a Water Issue in Mangaluru
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Crowdsourcing ground-level water shortages, leakages, and contamination incidents across municipal demonstration zones.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Moderation Queue Active</span>
        </div>
      </div>

      {/* Main Grid: Form on Left, Moderation Queue on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submission Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <Send className="w-4 h-4 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">
              Citizen Incident Submission Form
            </h2>
          </div>

          {submitSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Thank you!</strong>
                <p className="mt-0.5">{submitSuccess}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Service Area */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Demonstration Service Area *
              </label>
              <select
                value={areaCode}
                onChange={(e) => handleAreaSelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-sky-500 focus:border-sky-500"
              >
                {areas.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.name} ({a.area_type})
                  </option>
                ))}
              </select>
            </div>

            {/* Issue Type & Severity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Issue Type *
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="Water shortage">Water Shortage</option>
                  <option value="Pipeline leakage">Pipeline Leakage</option>
                  <option value="Water contamination">Contaminated Water</option>
                  <option value="Low water pressure">Low Water Pressure</option>
                  <option value="No water supply">No Water Supply</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Perceived Severity *
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Description & Landmarks *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., Near Kadri temple circle, murky tap water with foul smell since yesterday morning..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            {/* Optional Reporter Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Your Name (Optional)
                </label>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Rajesh Kumar"
                    className="bg-transparent border-none outline-none text-xs w-full text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Contact / Phone (Optional)
                </label>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="98450 XXXXX"
                    className="bg-transparent border-none outline-none text-xs w-full text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Coordinates (Optional) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Latitude (Optional)
                </label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="12.8911"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Longitude (Optional)
                </label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="74.8624"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-sky-600/30 transition text-xs"
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Submit Water Report</span>
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              All submissions enter the municipal moderation queue before appearing in official operational feeds.
            </p>
          </form>
        </div>

        {/* Right Column: Moderation Center & Community Feed (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Municipal Moderation & Citizen Feed
                </h2>
                <p className="text-xs text-slate-500">
                  Review and validate community reports to prevent bogus anomalies from skewing AI metrics
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Status:</span>
                <select
                  value={moderationFilter}
                  onChange={(e) => setModerationFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                >
                  <option value="ALL">All Reports</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {loadingReports ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-sky-600 animate-spin" />
                  <span className="text-xs text-slate-400">Loading citizen reports...</span>
                </div>
              ) : reports.length > 0 ? (
                reports.map((r) => (
                  <div
                    key={r.report_id}
                    className={`p-4 rounded-xl border text-xs transition ${
                      r.moderation_status === "PENDING"
                        ? "bg-amber-50/40 border-amber-200"
                        : r.moderation_status === "APPROVED"
                        ? "bg-slate-50 border-slate-200"
                        : "bg-red-50/30 border-red-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {r.report_id}
                        </span>
                        <span className="font-bold text-slate-800">
                          {r.area_name || r.area_code}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-700">{r.issue_type}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          r.severity === "CRITICAL" ? "bg-red-100 text-red-800" :
                          r.severity === "HIGH" ? "bg-orange-100 text-orange-800" :
                          r.severity === "MODERATE" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"
                        }`}>
                          {r.severity}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.moderation_status === "PENDING" ? "bg-amber-500 text-white" :
                        r.moderation_status === "APPROVED" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"
                      }`}>
                        {r.moderation_status}
                      </span>
                    </div>

                    <p className="text-slate-600 mt-2">
                      {r.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-200/50">
                      <div className="flex items-center gap-3">
                        <span>Reported by: <strong>{r.reporter_name}</strong></span>
                        {r.contact_info && <span>({r.contact_info})</span>}
                        <span>• {r.reported_at ? new Date(r.reported_at).toLocaleString() : ""}</span>
                      </div>

                      {/* Moderation Action Buttons for PENDING */}
                      {r.moderation_status === "PENDING" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleModerate(r.report_id, "APPROVED")}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition"
                          >
                            <Check className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleModerate(r.report_id, "REJECTED")}
                            className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition"
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No reports in this view.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
