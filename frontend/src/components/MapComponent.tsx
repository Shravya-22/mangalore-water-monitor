"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  areas: any[];
  selectedArea: any;
  onSelectArea: (area: any) => void;
}

export default function MapComponent({ areas, selectedArea, onSelectArea }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});

  // Synthetic water sources to display on the map for hydrological context
  const SYNTHETIC_SOURCE_MARKERS = [
    {
      id: "SRC-THUMBE",
      name: "Thumbe Vented Dam Intake (Netravati River)",
      subtext: "Primary Municipal Intake (Synthetic Demo Node S1)",
      lat: 12.8835,
      lng: 74.9850,
      color: "#0284c7"
    },
    {
      id: "SRC-AMR",
      name: "AMR Vent-Dam Balancing Headworks",
      subtext: "Upstream Netravati Balancing (Synthetic Demo Node S2)",
      lat: 12.8950,
      lng: 75.0450,
      color: "#0369a1"
    },
    {
      id: "SRC-GURUPURA",
      name: "Gurupura Basin Pumping Station",
      subtext: "Phalguni River Intake (Synthetic Demo Node S3)",
      lat: 12.9390,
      lng: 74.9220,
      color: "#0891b2"
    }
  ];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet Map centered on Mangaluru urban center
      const map = L.map(mapContainerRef.current, {
        center: [12.8911, 74.8560],
        zoom: 12,
        scrollWheelZoom: true,
      });

      // Add OpenStreetMap TileLayer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Add Synthetic Sources Markers
      SYNTHETIC_SOURCE_MARKERS.forEach((src) => {
        const iconHtml = `
          <div style="background-color: ${src.color}; width: 28px; height: 28px; border-radius: 8px; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); color: white; font-size: 14px;">
            💧
          </div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-source-marker",
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([src.lat, src.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <div style="font-size: 10px; font-weight: bold; color: #0284c7; text-transform: uppercase;">Synthetic Intake Node</div>
            <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-top: 2px;">${src.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${src.subtext}</div>
            <div style="font-size: 10px; color: #d97706; margin-top: 4px; font-style: italic;">*Clearly labeled synthetic demo representation.</div>
          </div>
        `);
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Update or create Area Markers
    areas.forEach((area) => {
      const color = area.marker_color || "#06b6d4";
      const isSelected = selectedArea?.code === area.code;

      if (markersRef.current[area.code]) {
        map.removeLayer(markersRef.current[area.code]);
      }

      const circle = L.circleMarker([area.lat, area.lng], {
        radius: isSelected ? 16 : 12,
        fillColor: color,
        color: isSelected ? "#0f172a" : "#ffffff",
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(map);

      circle.bindTooltip(`
        <div style="font-family: sans-serif;">
          <strong>${area.name}</strong> (${area.code})<br/>
          Crisis: <span style="font-weight: bold; color: ${color}">${area.crisis_label}</span><br/>
          WSI: ${area.current_wsi.toFixed(2)} | Deficit: ${area.current_gap_mld} MLD
        </div>
      `, { direction: "top", offset: [0, -10] });

      circle.on("click", () => {
        onSelectArea(area);
      });

      markersRef.current[area.code] = circle;
    });

  }, [areas, selectedArea]);

  // Pan to selected area when changed
  useEffect(() => {
    if (selectedArea && mapInstanceRef.current) {
      mapInstanceRef.current.setView([selectedArea.lat, selectedArea.lng], 13, {
        animate: true,
      });
    }
  }, [selectedArea]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />;
}
