"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Github,
  Key,
} from "lucide-react";
import { NextMonthForecast } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface ForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  forecast: NextMonthForecast | null;
}

export function ForecastModal({ isOpen, onClose, forecast }: ForecastModalProps) {
  const [gitStatus, setGitStatus] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/github-status")
        .then((r) => r.json())
        .then((d) => setGitStatus(d))
        .catch(() => setGitStatus({ connected: false }));
    }
  }, [isOpen]);

  if (!isOpen || !forecast) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/65 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="flex-1 w-full" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                Previsión Fin de Mes
              </h2>
              <p className="text-xs text-slate-400">
                {forecast.targetMonthName} {forecast.targetYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Main Hero Card: Aportación Sugerida */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs text-emerald-100 font-medium pb-2 border-b border-emerald-500/50">
              <span>Transferir antes del día 1</span>
              <span>50% por Persona</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-emerald-200 block font-bold">
                  Aportación Sugerida
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
                Con colchón de seguridad: <strong>{forecast.recommendedDepositPerPerson} €</strong> cada uno.
              </span>
            </div>
          </div>

          {/* GitHub DB Persistence Status Card */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-slate-800" />
                <span className="text-xs font-bold text-slate-800">
                  Persistencia en GitHub (dga80/conApp)
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  gitStatus?.connected
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {gitStatus?.connected ? "● Conectado (Auto-commit)" : "● Modo Lectura"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {gitStatus?.connected
                ? "Cada gasto nuevo se guarda automáticamente creando un commit en data/budget-2026.json."
                : "Para guardar transacciones en la nube desde el móvil, añade tu GITHUB_TOKEN en las variables de entorno de Netlify."}
            </p>
          </div>

          {/* Breakdown by Nature */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Desglose de Cargos
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  🔒 Fijos Mensuales
                </span>
                <span className="text-sm font-black text-slate-900">
                  {formatCurrency(forecast.fixedTotal)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  🛒 Variables Estimados
                </span>
                <span className="text-sm font-black text-slate-900">
                  {formatCurrency(forecast.estimatedVariableTotal)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  💳 Financiaciones
                </span>
                <span className="text-sm font-black text-slate-900">
                  {formatCurrency(forecast.financedTotal)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  📅 Periódicos
                </span>
                <span className="text-sm font-black text-slate-900">
                  {formatCurrency(forecast.periodicExpectedTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline of upcoming bills */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              Calendario de Cobros Previstos ({forecast.upcomingBills.length})
            </span>

            <div className="space-y-1.5">
              {forecast.upcomingBills.map((bill, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {bill.estimatedDay ? `d${bill.estimatedDay}` : "~"}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {bill.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {bill.category}
                      </span>
                    </div>
                  </div>
                  <span className="font-black text-slate-900">
                    {formatCurrency(bill.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-[#0F172A] text-white font-bold rounded-2xl text-xs active:scale-95 transition-transform"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
