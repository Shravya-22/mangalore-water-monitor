"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { fetchAreas } from "@/lib/api";
import {
  Map as MapIcon,
  Layers,
  Info,
  Droplets,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  LocateFixed
} from "lucide-react";

// Dynamically import Leaflet MapComponent to avoid SSR errors
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-slate-100 flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200">
      <RefreshCw className="w-6 h-6 text-sky-600 animate-spin" />
      <span className="text-slate-500 text-xs font-medium">Loading Mangaluru Geospatial Map Layer...</span>
    </div>
  ),
});

export default function MangaluruMapPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchAreas();
        setAreas(res.service_areas || []);
        if (res.service_areas && res.service_areas.length > 0) {
          setSelectedArea(res.service_areas[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const crisisLegend = [
    { label: "Level 0: No Crisis", color: "#10b981", desc: "Storage > 45%, full supply coverage" },
    { label: "Level 1: Minor Stress", color: "#06b6d4", desc: "Storage 30-45%, slight supply gap" },
    { label: "Level 2: Moderate Crisis", color: "#f59e0b", desc: "Storage 15-30%, visible rationing" },
    { label: "Level 3: High Crisis", color: "#f97316", desc: "Storage 5-15%, emergency tanker dispatch" },
    { label: "Level 4: Critical Crisis", color: "#ef4444", desc: "Storage < 5%, severe water deficit" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
              Geospatial Intelligence
            </span>
            <span className="text-xs text-slate-500">
              Interactive Coastal GIS Layer
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mangaluru Demonstration Service Areas Map
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing 8 demonstration service areas and synthetic intake nodes across the Arabian Sea coastal plain.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium">
            8 Service Areas Active
          </span>
        </div>
      </div>

      {/* Main Map + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map Container */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <MapIcon className="w-4 h-4 text-sky-600" />
              <span>Mangaluru Coastal Terrain & Demo Water Grids</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Click any circle marker to inspect area metrics
            </div>
          </div>

          <div className="h-[380px] sm:h-[520px] w-full relative">
            <MapComponent
              areas={areas}
              selectedArea={selectedArea}
              onSelectArea={(a) => setSelectedArea(a)}
            />
          </div>

          {/* Map Legend */}
          <div className="p-3 bg-slate-50 border-t border-slate-200">
            <div className="text-[11px] font-semibold text-slate-600 mb-2">Crisis Risk Classification Legend:</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
              {crisisLegend.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Area Detail Sidebar */}
        <div className="space-y-4">
          {selectedArea ? (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {selectedArea.code}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedArea.name}
                  </h2>
                  <p className="text-xs text-slate-500">{selectedArea.area_type}</p>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: selectedArea.marker_color }}
                >
                  {selectedArea.crisis_label}
                </span>
              </div>

              {/* Area KPIs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Water Security Index</span>
                  <span className="text-lg font-bold text-slate-900">{selectedArea.current_wsi.toFixed(3)}</span>
                  <span className="text-[10px] text-slate-500 block">0.0 – 1.0 composite</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Serviced Population</span>
                  <span className="text-lg font-bold text-slate-900">{selectedArea.population.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block">Baseline: {selectedArea.base_lpcd} LPCD</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Daily Demand</span>
                  <span className="text-base font-bold text-slate-900">{selectedArea.current_demand_mld} MLD</span>
                  <span className="text-[10px] text-slate-500 block">Municipal requirement</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Actual Piped Supply</span>
                  <span className="text-base font-bold text-slate-900">{selectedArea.current_supply_mld} MLD</span>
                  <span className="text-[10px] text-slate-500 block">Delivered volume</span>
                </div>
              </div>

              {/* Deficit / Gap */}
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-rose-900">Demand-Supply Deficit:</span>
                  <span className="text-sm font-bold text-rose-700">{selectedArea.current_gap_mld} MLD</span>
                </div>
                <div className="text-[11px] text-rose-800 mt-1">
                  Supply coverage ratio is currently {((selectedArea.current_supply_mld / selectedArea.current_demand_mld) * 100).toFixed(1)}%.
                </div>
              </div>

              {/* Groundwater Vulnerability Profile */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Aquifer & Local Vulnerability
                </span>
                <div className="flex justify-between text-slate-700">
                  <span>Static Depth Baseline:</span>
                  <span className="font-semibold">{selectedArea.gw_base_depth} m bgl</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Vulnerability Category:</span>
                  <span className="font-semibold text-amber-700">{selectedArea.gw_vulnerability}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Baseline NRW Loss:</span>
                  <span className="font-semibold">{selectedArea.nrw_base_pct}%</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href={`/predictions?area=${selectedArea.code}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition"
                >
                  <span>View Multi-Horizon Forecast for {selectedArea.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
              Select an area marker to view localized analytics.
            </div>
          )}

          {/* Quick Area Switcher List */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-2">All Demonstration Service Areas:</h3>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {areas.map((a) => (
                <button
                  key={a.code}
                  onClick={() => setSelectedArea(a)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                    selectedArea?.code === a.code
                      ? "bg-sky-50 border border-sky-300 font-semibold text-sky-900"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.marker_color }} />
                    {a.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{a.current_gap_mld > 0 ? `${a.current_gap_mld} MLD gap` : "Balanced"}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
