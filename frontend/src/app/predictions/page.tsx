"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchPredictions, fetchAreas } from "@/lib/api";
import {
  BrainCircuit,
  Calendar,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
  ChevronRight,
  Filter
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";

function PredictionsContent() {
  const searchParams = useSearchParams();
  const initialArea = searchParams.get("area") || "ALL";

  const [horizon, setHorizon] = useState<"1d" | "7d" | "14d">("7d");
  const [selectedAreaCode, setSelectedAreaCode] = useState<string>(initialArea);
  const [predictionsData, setPredictionsData] = useState<any>(null);
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [pData, aData] = await Promise.all([
          fetchPredictions(horizon, selectedAreaCode === "ALL" ? undefined : selectedAreaCode),
          fetchAreas()
        ]);
        setPredictionsData(pData);
        setAreas(aData.service_areas || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [horizon, selectedAreaCode]);

  const classBadges: { [key: number]: { label: string; color: string; bg: string } } = {
    0: { label: "NO CRISIS", color: "text-emerald-700", bg: "bg-emerald-100 border-emerald-300" },
    1: { label: "MINOR STRESS", color: "text-cyan-700", bg: "bg-cyan-100 border-cyan-300" },
    2: { label: "MODERATE CRISIS", color: "text-amber-700", bg: "bg-amber-100 border-amber-300" },
    3: { label: "HIGH CRISIS", color: "text-orange-700", bg: "bg-orange-100 border-orange-300" },
    4: { label: "CRITICAL CRISIS", color: "text-rose-700", bg: "bg-rose-100 border-rose-300" },
  };

  const featureChartData = (predictionsData?.top_contributing_features || []).slice(0, 8).map((f: any) => ({
    name: f.feature.replace(/_/g, " "),
    importance: Math.round(f.importance)
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5" />
              Direct Multi-Horizon ML Pipeline
            </span>
            <span className="text-xs text-slate-500">
              Model: LightGBM GBDT (Leaf-Wise Split)
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            AI Urban Water Crisis Forecasting
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Horizon-specific direct multi-step forecasting for Mangaluru demonstration zones.
          </p>
        </div>

        {/* Horizon Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setHorizon("1d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              horizon === "1d"
                ? "bg-white text-sky-700 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            1-Day Ahead
          </button>
          <button
            onClick={() => setHorizon("7d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              horizon === "7d"
                ? "bg-white text-sky-700 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            7-Day Ahead
          </button>
          <button
            onClick={() => setHorizon("14d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              horizon === "14d"
                ? "bg-white text-sky-700 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            14-Day Ahead
          </button>
        </div>
      </div>

      {/* Filter and Overview Controls */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Filter Location:</span>
          <select
            value={selectedAreaCode}
            onChange={(e) => setSelectedAreaCode(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-1.5 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="ALL">All Mangaluru Demonstration Service Areas</option>
            {areas.map((a) => (
              <option key={a.code} value={a.code}>
                {a.name} ({a.code})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Active Forecast Horizon: <strong className="text-slate-800">{predictionsData?.forecast_horizon_label}</strong></span>
        </div>
      </div>

      {/* Grid of Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
            <p className="text-xs text-slate-500">Evaluating multi-horizon LightGBM model...</p>
          </div>
        ) : predictionsData?.predictions && predictionsData.predictions.length > 0 ? (
          predictionsData.predictions.map((p: any) => {
            const badge = classBadges[p.predicted_class] || classBadges[0];
            return (
              <div
                key={p.area_code}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {p.area_code}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-1">
                        {p.area_name}
                      </h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Confidence Metric */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Model Confidence:</span>
                      <span className="font-bold text-slate-900">{p.confidence_pct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-sky-600 rounded-full"
                        style={{ width: `${p.confidence_pct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>Forecast Target Date:</span>
                      <span className="font-semibold text-slate-600">{p.target_date}</span>
                    </div>
                  </div>

                  {/* Class Probabilities Distribution */}
                  <div className="mt-4 space-y-1.5">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Class Probabilities:
                    </div>
                    {[
                      { lbl: "L0 (None)", p: p.probability_level_0, color: "bg-emerald-500" },
                      { lbl: "L1 (Minor)", p: p.probability_level_1, color: "bg-cyan-500" },
                      { lbl: "L2 (Mod)", p: p.probability_level_2, color: "bg-amber-500" },
                      { lbl: "L3 (High)", p: p.probability_level_3, color: "bg-orange-500" },
                      { lbl: "L4 (Crit)", p: p.probability_level_4, color: "bg-rose-500" },
                    ].map((row) => (
                      <div key={row.lbl} className="flex items-center text-[10px] gap-2">
                        <span className="w-16 text-slate-500 truncate">{row.lbl}</span>
                        <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${row.color}`}
                            style={{ width: `${Math.round(row.p * 100)}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-mono text-slate-700">
                          {Math.round(row.p * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Risk Assessment:</span>
                  <span className={`font-bold ${
                    p.predicted_class >= 3 ? "text-rose-600" :
                    p.predicted_class === 2 ? "text-amber-600" :
                    p.predicted_class === 1 ? "text-cyan-700" : "text-emerald-600"
                  }`}>
                    {p.risk_level}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-8 text-center text-slate-400 text-xs">
            No predictions found for this filter.
          </div>
        )}
      </div>

      {/* Feature Importance Drivers for Selected Horizon */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Top Contributing Features for {predictionsData?.forecast_horizon_label} Forecasting
            </h2>
            <p className="text-xs text-slate-500">
              Feature importance rankings derived from the trained LightGBM gradient boosted decision trees
            </p>
          </div>
          <span className="text-xs bg-sky-50 text-sky-700 px-2.5 py-1 rounded font-medium border border-sky-100">
            Explainable AI (MDI Score)
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={featureChartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 140, bottom: 10 }}
            >
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={130}
              />
              <Tooltip
                formatter={(val: any) => [`${val} Splits/Gain`, "Importance"]}
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
              />
              <Bar dataKey="importance" fill="#0284c7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Storage adequacy, supply-demand deficits, 14-day lagged gap, and the Water Security Index consistently dominate predictive decisions across horizons, demonstrating domain validity.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PredictionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
          <p className="text-slate-500 text-xs font-medium">Loading AI Prediction Engine...</p>
        </div>
      }
    >
      <PredictionsContent />
    </Suspense>
  );
}
