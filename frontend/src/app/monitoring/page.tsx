"use client";

import React, { useEffect, useState } from "react";
import { fetchWaterResources, fetchAreas } from "@/lib/api";
import {
  Droplets,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  CloudRain,
  Activity,
  Layers,
  ArrowDownUp
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

export default function WaterResourceMonitoringPage() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [daysWindow, setDaysWindow] = useState<number>(90);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [resData, areasData] = await Promise.all([
          fetchWaterResources(selectedLocation === "ALL" ? undefined : selectedLocation, daysWindow),
          fetchAreas()
        ]);
        setTimeline(resData.timeline_data || []);
        setSources(resData.water_sources || []);
        setAreas(areasData.service_areas || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedLocation, daysWindow]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5" />
              Hydrological Surveillance
            </span>
            <span className="text-xs text-slate-500">
              Multi-source Time-Series Analytics
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Water Resource & Operational Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring reservoir retention, streamflow hydrographs, rainfall patterns, groundwater aquifers, and NRW.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent text-slate-800 border-none outline-none text-xs cursor-pointer"
            >
              <option value="ALL">All Mangaluru (System-Wide)</option>
              {areas.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.name} ({a.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={daysWindow}
              onChange={(e) => setDaysWindow(Number(e.target.value))}
              className="bg-transparent text-slate-800 border-none outline-none text-xs cursor-pointer"
            >
              <option value={30}>Last 30 Days</option>
              <option value={60}>Last 60 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={180}>Last 180 Days (Half Year)</option>
              <option value={365}>Full Year (365 Days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Synthetic Water Sources Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sources.map((s) => (
          <div
            key={s.source_id}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-bold">
                  {s.source_id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  s.status === "Optimal" ? "bg-emerald-100 text-emerald-800" :
                  s.status === "Adequate" ? "bg-sky-100 text-sky-800" :
                  s.status === "Depleting" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                }`}>
                  {s.status}
                </span>
              </div>
              <h3 className="font-bold text-xs text-slate-900 mt-2 line-clamp-1">
                {s.source_name}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Cap: {s.capacity_mcm} MCM | Stored: {s.current_storage_mcm} MCM
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Storage Fill</span>
                <span className="font-bold text-slate-800">{s.storage_percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-600 rounded-full"
                  style={{ width: `${s.storage_percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart 1: Reservoir Storage Fill % and Rainfall */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Reservoir Storage Percentage & Rainfall Response
            </h2>
            <p className="text-xs text-slate-500">
              Correlating daily rainfall events with vented dam storage replenishment and depletion
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {timeline.length} Daily Observations
          </span>
        </div>

        <div className="h-72 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-sky-600 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="storageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} unit="mm" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="storage_percentage"
                  name="Storage Fill %"
                  stroke="#0284c7"
                  fillOpacity={1}
                  fill="url(#storageGrad)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="rainfall_mm"
                  name="Rainfall (mm)"
                  fill="#0d9488"
                  opacity={0.7}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Demand vs Municipal Supply and Deficit Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Water Demand vs. Municipal Piped Supply
              </h2>
              <p className="text-xs text-slate-500">
                Daily volumetric tracking in MLD (Million Litres per Day)
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit=" MLD" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="demand_mld" name="Water Demand (MLD)" stroke="#f43f5e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="supply_mld" name="Municipal Supply (MLD)" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="gap_mld" name="Deficit Gap (MLD)" stroke="#eab308" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Groundwater Depth & Aquifer Stress */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Groundwater Table Depth & Aquifer Stress
              </h2>
              <p className="text-xs text-slate-500">
                Tracking static water table depth (m bgl) and drawdown during dry summer periods
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" reversed tick={{ fontSize: 10 }} unit="m" label={{ value: "Depth (m bgl)", angle: -90, position: "insideLeft", fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[0, 1]} label={{ value: "Stress Index", angle: 90, position: "insideRight", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line yAxisId="left" type="monotone" dataKey="groundwater_depth_m" name="Water Table Depth (m bgl)" stroke="#d97706" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="groundwater_stress" name="Aquifer Stress (0-1)" stroke="#dc2626" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 4: River Inflow vs Outflow & Non-Revenue Water (NRW) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Netravati & Gurupura Streamflow (Inflow vs Outflow)
              </h2>
              <p className="text-xs text-slate-500">
                River discharge and spillway venting rates in MCM/day
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit=" MCM" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area type="monotone" dataKey="inflow_mcm" name="Catchment Inflow (MCM/d)" stroke="#0284c7" fill="#bae6fd" />
                <Area type="monotone" dataKey="outflow_mcm" name="Municipal Outflow (MCM/d)" stroke="#0d9488" fill="#99f6e4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Non-Revenue Water (NRW) Percentage */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Non-Revenue Water (NRW) Loss Percentage
              </h2>
              <p className="text-xs text-slate-500">
                Tracking pipe leakage, illegal tappings, and commercial unmetered water losses
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[15, 55]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="nrw_percentage" name="NRW Percentage (%)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
