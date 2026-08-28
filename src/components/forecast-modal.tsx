"use client";

import React from "react";
import {
  X,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { NextMonthForecast } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface ForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  forecast: NextMonthForecast | null;
}

export function ForecastModal({ isOpen, onClose, forecast }: ForecastModalProps) {
  if (!isOpen || !forecast) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/65 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="flex-1 w-full" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Previsión Fin de Mes ({forecast.targetMonthName} {forecast.targetYear})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aportación recomendada para evitar descubiertos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Main Hero Card: Aportación Sugerida */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs text-emerald-100 font-medium pb-2 border-b border-emerald-500/50">
              <span>Transferir a cuenta común antes del día 1</span>
              <span>Reparto 50%</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-200 block font-semibold">
                  Aportación por persona
                </span>
                <span className="text-3xl sm:text-4xl font-black tracking-tight">
                  {formatCurrency(forecast.sharePerPerson)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-200 block">Total Previsto</span>
                <span className="text-lg font-bold text-white">
                  {formatCurrency(forecast.totalForecast)}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-black/15 rounded-xl text-xs text-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>
                Recomendación con colchón: <strong>{forecast.recommendedDepositPerPerson} €</strong> cada uno.
              </span>
            </div>
          </div>

          {/* Breakdown by Nature */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Desglose de Cargos Previstos
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  🔒 Fijos Mensuales
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(forecast.fixedTotal)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  🛒 Variables Estimados
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(forecast.estimatedVariableTotal)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  💳 Financiaciones
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(forecast.financedTotal)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  📅 Periódicos / Anuales
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(forecast.periodicExpectedTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline of upcoming bills */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              Calendario Estimado de Cobros ({forecast.upcomingBills.length})
            </span>

            <div className="space-y-1.5">
              {forecast.upcomingBills.map((bill, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {bill.estimatedDay ? `d${bill.estimatedDay}` : "~"}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {bill.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {bill.nature === "FIXED" ? "Fijo mensual" : bill.nature === "VARIABLE" ? "Variable" : bill.nature === "FINANCED" ? "Cuota financiada" : "Periódico"} • {bill.category}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(bill.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs active:scale-95 transition-transform"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
