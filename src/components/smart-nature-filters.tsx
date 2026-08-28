"use client";

import React from "react";
import { Lock, Shuffle, Calendar, CreditCard, Layers } from "lucide-react";

export type FilterType = "ALL" | "FIXED" | "VARIABLE" | "PERIODIC" | "FINANCED";

interface SmartNatureFiltersProps {
  currentFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  counts: {
    all: number;
    fixed: number;
    variable: number;
    periodic: number;
    financed: number;
  };
}

export function SmartNatureFilters({
  currentFilter,
  onSelectFilter,
  counts,
}: SmartNatureFiltersProps) {
  const filters: { id: FilterType; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "ALL", label: "Todos", icon: <Layers className="w-3.5 h-3.5" />, count: counts.all },
    { id: "FIXED", label: "Fijos", icon: <Lock className="w-3.5 h-3.5" />, count: counts.fixed },
    { id: "VARIABLE", label: "Variables", icon: <Shuffle className="w-3.5 h-3.5" />, count: counts.variable },
    { id: "PERIODIC", label: "Bimensuales/Anuales", icon: <Calendar className="w-3.5 h-3.5" />, count: counts.periodic },
    { id: "FINANCED", label: "Plazos", icon: <CreditCard className="w-3.5 h-3.5" />, count: counts.financed },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {filters.map((f) => {
        const isActive = currentFilter === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 ${
              isActive
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
            }`}
          >
            {f.icon}
            <span>{f.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive
                  ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
              }`}
            >
              {f.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
