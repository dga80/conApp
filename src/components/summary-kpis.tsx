"use client";

import React from "react";
import {
  Scale,
  Sparkles,
  Lock,
  Shuffle,
  Calendar,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { MonthSummary } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface SummaryKPIsProps {
  summary: MonthSummary;
  onOpenForecast?: () => void;
}

export function SummaryKPIs({ summary, onOpenForecast }: SummaryKPIsProps) {
  const budgetRatio =
    summary.totalIncome > 0
      ? (summary.totalExpenses / summary.totalIncome) * 100
      : 0;

  const isOverBudget = summary.totalExpenses > summary.totalIncome;

  return (
    <div className="space-y-3">
      {/* 50/50 Split Highlight Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white p-5 shadow-xl border border-slate-800">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header: Cuota por persona */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Aportación 50% por Persona
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                {formatCurrency(summary.sharePerPerson)}
              </span>
              <span className="text-xs text-slate-400">/ mes</span>
            </div>
          </div>

          {onOpenForecast && (
            <button
              type="button"
              onClick={onOpenForecast}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Previsión Fin de Mes</span>
            </button>
          )}
        </div>

        {/* Breakdown by Nature Badges */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-0.5 text-xs">
          <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-blue-400" />
              <span>Fijos</span>
            </span>
            <span className="font-bold text-sm text-slate-100 block mt-0.5">
              {formatCurrency(summary.fixedExpensesTotal)}
            </span>
          </div>

          <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Shuffle className="w-3 h-3 text-amber-400" />
              <span>Variables</span>
            </span>
            <span className="font-bold text-sm text-slate-100 block mt-0.5">
              {formatCurrency(summary.variableExpensesTotal)}
            </span>
          </div>

          <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-purple-400" />
              <span>Plazos/Perió.</span>
            </span>
            <span className="font-bold text-sm text-slate-100 block mt-0.5">
              {formatCurrency(summary.financedExpensesTotal + summary.periodicExpensesTotal)}
            </span>
          </div>
        </div>

        {/* Progress Bar with Budget alert */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <span>Gastos Totales:</span>
              <strong className="text-white font-bold">
                {formatCurrency(summary.totalExpenses)}
              </strong>
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <span>Ingresos ({summary.monthName}):</span>
              <strong className="text-emerald-400 font-bold">
                {formatCurrency(summary.totalIncome)}
              </strong>
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? "bg-rose-500"
                  : budgetRatio > 90
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, budgetRatio)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span
              className={
                isOverBudget
                  ? "text-rose-400 font-semibold flex items-center gap-1"
                  : "text-slate-400"
              }
            >
              {isOverBudget ? (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  Déficit mensual: {formatCurrency(Math.abs(summary.netBalance))}
                </>
              ) : (
                `Ahorro disponible: ${formatCurrency(summary.netBalance)}`
              )}
            </span>
            <span className="text-slate-400">
              {budgetRatio.toFixed(1)}% del presupuesto
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
