import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import DemoBanner from "@/components/DemoBanner";

export const metadata: Metadata = {
  title: "Mangaluru Water Intelligence | AI Urban Water Crisis Forecasting",
  description: "AI-Powered Urban Water Crisis Forecasting and Monitoring System for Mangaluru, Karnataka, India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-slate-50 text-slate-900 flex flex-col min-h-screen">
        <DemoBanner />
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-300">
                MANGALURU WATER INTELLIGENCE PLATFORM (2026)
              </p>
              <p className="text-[11px] text-slate-500">
                Department of AI & Data Science | Synthetic Demonstration Simulation for Mangaluru, Karnataka
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <p>Hydrological Models: Netravati & Gurupura Coastal Basins</p>
              <p>Primary Engine: LightGBM Direct Multi-Horizon Estimators</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
