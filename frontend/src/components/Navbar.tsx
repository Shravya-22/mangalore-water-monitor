"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Droplets,
  LayoutDashboard,
  Map,
  BrainCircuit,
  BarChart3,
  Bell,
  MessageSquarePlus,
  Sliders,
  ShieldCheck,
  Menu,
  X,
  UserCheck
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("Water Authority Officer");

  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Mangaluru Map", href: "/map", icon: Map },
    { name: "AI Prediction", href: "/predictions", icon: BrainCircuit },
    { name: "Resources", href: "/monitoring", icon: Droplets },
    { name: "Alerts", href: "/alerts", icon: Bell },
    { name: "Report Issue", href: "/report", icon: MessageSquarePlus },
    { name: "Model Eval", href: "/performance", icon: BarChart3 },
    { name: "Admin & ETL", href: "/admin", icon: Sliders },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-base md:text-lg tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-white bg-clip-text text-transparent">
                MANGALURU WATER INTELLIGENCE
              </div>
              <div className="text-[10px] md:text-xs text-slate-400 tracking-wider uppercase font-medium">
                AI Urban Crisis Forecasting & Monitoring
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-sky-600/30 text-sky-300 border border-sky-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Role / Demo Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="bg-transparent text-slate-200 border-none outline-none text-xs cursor-pointer focus:ring-0"
              >
                <option value="Water Authority Officer" className="bg-slate-800 text-white">Water Authority Officer</option>
                <option value="Hydrological Analyst" className="bg-slate-800 text-white">Hydrological Analyst</option>
                <option value="MCC Administrator" className="bg-slate-800 text-white">MCC Administrator</option>
                <option value="Citizen Observer" className="bg-slate-800 text-white">Citizen Observer</option>
              </select>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-lg bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-sky-600/30 text-sky-300 border border-sky-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
