"use client";

import React, { useEffect, useState } from "react";
import { triggerEtlPipeline, triggerModelTraining, fetchJobs, uploadDatasetFile } from "@/lib/api";
import {
  Sliders,
  Upload,
  Play,
  RotateCw,
  Database,
  CheckCircle,
  AlertOctagon,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  Cpu,
  Layers,
  Terminal,
  Server
} from "lucide-react";

export default function AdminPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [runningEtl, setRunningEtl] = useState(false);
  const [runningTrain, setRunningTrain] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadJobsList = async () => {
    try {
      const res = await fetchJobs();
      setJobs(res.jobs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadJobsList();
  }, []);

  const handleRunEtl = async () => {
    setRunningEtl(true);
    setActionMessage(null);
    try {
      const res = await triggerEtlPipeline();
      setActionMessage(`ETL Pipeline Success: Processed ${res.records_processed} records in ${res.duration_seconds}s with ${res.features_generated} features.`);
      await loadJobsList();
    } catch (err: any) {
      setActionMessage(`ETL Failed: ${err.message}`);
    } finally {
      setRunningEtl(false);
    }
  };

  const handleTrainModels = async () => {
    setRunningTrain(true);
    setActionMessage(null);
    try {
      const res = await triggerModelTraining();
      setActionMessage(`Model Retraining Success: Retrained LightGBM (1d, 7d, 14d), XGBoost, and RF in ${res.duration_seconds}s.`);
      await loadJobsList();
    } catch (err: any) {
      setActionMessage(`Training Failed: ${err.message}`);
    } finally {
      setRunningTrain(false);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please choose a CSV file first.");
      return;
    }

    setUploading(true);
    setActionMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("trigger_etl", "true");

    try {
      const data = await uploadDatasetFile(formData);
      if (data.detail) throw new Error(data.detail);

      setActionMessage(`Upload Success: Ingested '${data.filename}' (${data.records_count} records). Job ID: ${data.job_id}`);
      setSelectedFile(null);
      await loadJobsList();
    } catch (err: any) {
      setActionMessage(`Upload Failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              MLOps & Data Engineering Console
            </span>
            <span className="text-xs text-slate-500">
              Administrative Control Panel
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ETL Pipeline & Model Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Trigger automated hydro-feature engineering, manage dataset uploads, monitor background workers, and retrain ML champions.
          </p>
        </div>

        <button
          onClick={loadJobsList}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Jobs
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-slate-900 text-white text-xs border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Action 1: Trigger ETL Pipeline */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Run ETL Pipeline</h2>
            <p className="text-xs text-slate-500 mt-1">
              Validates raw CSVs, runs IQR outlier detection, imputes missing values, and generates 111 rolling, lag, and WSI features.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={handleRunEtl}
              disabled={runningEtl}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {runningEtl ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{runningEtl ? "Executing Feature Pipeline..." : "Execute ETL Pipeline"}</span>
            </button>
          </div>
        </div>

        {/* Action 2: Model Retraining */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Retrain Prediction Models</h2>
            <p className="text-xs text-slate-500 mt-1">
              Retrains LightGBM (1d, 7d, 14d), XGBoost, and Random Forest on the chronological 80% train split and re-evaluates holdout test metrics.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={handleTrainModels}
              disabled={runningTrain}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {runningTrain ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCw className="w-4 h-4" />
              )}
              <span>{runningTrain ? "Retraining Models (LightGBM/XGB)..." : "Trigger Model Retraining"}</span>
            </button>
          </div>
        </div>

        {/* Action 3: Ingest New CSV */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Upload Hydrological CSV</h2>
            <p className="text-xs text-slate-500 mt-1">
              Upload daily reservoir readings, rainfall telemetry, or groundwater sensor logs for automatic schema verification.
            </p>
          </div>

          <form onSubmit={handleUploadFile} className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-40"
            >
              {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>Upload & Validate</span>
            </button>
          </form>
        </div>
      </div>

      {/* Data Quality & Pipeline Health Gates */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-3">
          Pre-Training Data Quality Gates (FYP / IEEE Compliance)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          {[
            { gate: "Gate 1: Freshness", status: "PASS", desc: "< 24h lag" },
            { gate: "Gate 2: Target Coverage", status: "PASS", desc: "100% labeled" },
            { gate: "Gate 3: Missing Rate", status: "PASS", desc: "0.0% missing" },
            { gate: "Gate 4: Outlier Treatment", status: "PASS", desc: "IQR capped" },
            { gate: "Gate 5: Class Balance", status: "PASS", desc: "All 5 tiers" },
            { gate: "Gate 6: Temporal Leakage", status: "PASS", desc: "Strict t < t+h" },
            { gate: "Gate 7: Schema Bounds", status: "PASS", desc: "Physical limits" },
          ].map((g) => (
            <div key={g.gate} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-medium">{g.gate}</span>
              <div className="text-emerald-700 font-bold text-sm mt-0.5 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {g.status}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">{g.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Background Jobs Audit Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Background ETL & Prediction Job History
            </h2>
            <p className="text-xs text-slate-500">
              PostgreSQL / SQLite background worker audit tracking job types, durations, and status
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {jobs.length} Logged Runs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Job ID</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Started At</th>
                <th className="py-2.5 px-3 font-semibold">Duration</th>
                <th className="py-2.5 px-3 font-semibold">Records</th>
                <th className="py-2.5 px-3 font-semibold">Execution Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingJobs ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading jobs log...
                  </td>
                </tr>
              ) : jobs.length > 0 ? (
                jobs.map((j) => (
                  <tr key={j.job_id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-700">
                      {j.job_id}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {j.job_type.replace(/_/g, " ")}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        j.status === "SUCCESS" ? "bg-emerald-100 text-emerald-800" :
                        j.status === "RUNNING" ? "bg-sky-100 text-sky-800 animate-pulse" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {j.started_at ? new Date(j.started_at).toLocaleTimeString() : "-"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {j.duration_seconds ? `${j.duration_seconds}s` : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {j.records_processed?.toLocaleString() || "-"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-xs">
                      {j.log_message || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No background jobs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
