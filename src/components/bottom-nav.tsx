"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Wallet, Plus, TrendingUp, Sparkles } from "lucide-react";

interface BottomNavProps {
  onOpenQuickEntry: () => void;
  onOpenForecast?: () => void;
}

export function BottomNav({ onOpenQuickEntry, onOpenForecast }: BottomNavProps) {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isAnnual = pathname === "/annual";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 pb-safe shadow-lg">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {/* 1. Overview */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isHome ? "text-emerald-600 font-bold" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <LayoutGrid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Overview</span>
        </Link>

        {/* 2. Budgets / Fijos */}
        <Link
          href="/#budgets"
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Wallet className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Budgets</span>
        </Link>

        {/* 3. Center FAB: Stitch dark circular button */}
        <div className="flex items-center justify-center px-2">
          <button
            type="button"
            onClick={onOpenQuickEntry}
            aria-label="Añadir nuevo gasto"
            className="w-12 h-12 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white flex items-center justify-center shadow-lg shadow-slate-900/30 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. Trends (Annual Matrix) */}
        <Link
          href="/annual"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isAnnual ? "text-emerald-600 font-bold" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Trends</span>
        </Link>

        {/* 5. Previsión / Settings */}
        <button
          type="button"
          onClick={onOpenForecast}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-emerald-500" />
          <span className="text-[10px] font-medium tracking-tight text-slate-500">Previsión</span>
        </button>
      </div>
    </nav>
  );
}
