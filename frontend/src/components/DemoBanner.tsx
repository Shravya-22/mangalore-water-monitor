"use client";

import React from "react";
import { AlertTriangle, Info, MapPin } from "lucide-react";

export default function DemoBanner() {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs md:text-sm text-amber-900 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-500 text-white shadow-sm">
          DEMO MODE
        </span>
        <span className="font-semibold text-amber-950">
          SYNTHETIC MANGALURU RESEARCH DATA
        </span>
        <span className="hidden md:inline text-amber-800">
          — Simulated coastal hydrological models for Dakshina Kannada. Not official MCC/KUWSDB government measurements.
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs font-medium text-amber-800">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          Mangaluru, Karnataka (12.91°N, 74.85°E)
        </span>
        <span className="bg-amber-200/80 px-2 py-0.5 rounded text-amber-900 font-mono">
          Seed: 42 (Reproducible)
        </span>
      </div>
    </div>
  );
}
