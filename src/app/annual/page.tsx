"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Home,
  Zap,
  Phone,
  ShieldCheck,
  ShoppingCart,
  GraduationCap,
  Activity,
  Package,
  TrendingDown,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { AnnualSummary, CategoryData } from "@/types";
import { getAnnualSummary, getAllCategories } from "@/lib/actions";
import { MONTH_NAMES_SHORT, formatCurrency } from "@/lib/utils";
import { BottomNav } from "@/components/bottom-nav";
import { QuickEntryDrawer } from "@/components/quick-entry-drawer";

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home className="w-4 h-4 text-slate-700" />,
  Zap: <Zap className="w-4 h-4 text-amber-500" />,
  Phone: <Phone className="w-4 h-4 text-indigo-500" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4 text-purple-500" />,
  ShoppingCart: <ShoppingCart className="w-4 h-4 text-emerald-600" />,
  GraduationCap: <GraduationCap className="w-4 h-4 text-rose-500" />,
  Activity: <Activity className="w-4 h-4 text-orange-500" />,
  Package: <Package className="w-4 h-4 text-slate-500" />,
};

export default function AnnualMatrixPage() {
  const [year, setYear] = useState(2026);
  const [data, setData] = useState<AnnualSummary | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);

  const loadAnnualData = async () => {
    setIsLoading(true);
    try {
      const [annual, cats] = await Promise.all([
        getAnnualSummary(year),
        getAllCategories(),
      ]);
      setData(annual);
      setCategories(cats);
    } catch (e) {
      console.error("Error loading annual matrix", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnualData();
  }, [year]);

  const exportCSV = () => {
    if (!data) return;
    let csv = "Categoria," + MONTH_NAMES_SHORT.join(",") + ",Total Anual,Media Mensual\n";
    data.rows.forEach((r) => {
      csv += `"${r.category.name}",${r.months.join(",")},${r.annualTotal},${r.monthlyAverage}\n`;
    });
    csv += `Total Gastos,${data.monthlyExpenses.join(",")},${data.totalAnnualExpenses},${(data.totalAnnualExpenses / 12).toFixed(2)}\n`;
    csv += `Ingresos,${data.monthlyIncomes.join(",")},${data.totalAnnualIncome},${(data.totalAnnualIncome / 12).toFixed(2)}\n`;
    csv += `Balance Neto,${data.monthlyBalances.join(",")},${data.totalAnnualBalance},${(data.totalAnnualBalance / 12).toFixed(2)}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `HomeBudget_Matriz_${year}.csv`;
    link.click();
  };

  return (
    <main className="flex-1 flex flex-col pb-24 bg-[#F8FAFC]">
      {/* Stitch Top Bar */}
      <header className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0 bg-[#F8FAFC]/95 backdrop-blur-xs z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-full text-slate-600 hover:bg-slate-200/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
            {year} Annual Overview
          </h1>
        </div>

        <button
          onClick={exportCSV}
          className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </header>

      <div className="px-5 space-y-4">
        {isLoading || !data ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Cargando matriz anual...</span>
          </div>
        ) : (
          <>
            {/* 3 Stitch KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: Total Spent YTD */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Spent YTD
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
                  {formatCurrency(data.totalAnnualExpenses)}
                </span>
                <span className="text-xs text-emerald-600 font-bold block pt-1">
                  ✓ En presupuesto (+{formatCurrency(data.totalAnnualBalance)} ahorro)
                </span>
              </div>

              {/* Card 2: Average Monthly */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Average Monthly
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
                  {formatCurrency(data.totalAnnualExpenses / 12)}
                </span>
                <span className="text-xs text-slate-400 font-medium block pt-1">
                  {(data.totalAnnualExpenses / 24).toFixed(2)} € / persona / mes
                </span>
              </div>

              {/* Card 3: Highest Expense (Dark Navy Card in Stitch) */}
              <div className="bg-[#0F172A] text-white rounded-3xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  HIGHEST EXPENSE
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  PISO (HOUSING)
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white block">
                  {formatCurrency(11603.34)}
                </span>
                <span className="text-[11px] text-slate-400 font-medium block pt-0.5">
                  42% del gasto total anual
                </span>
              </div>
            </div>

            {/* Stitch Category Matrix Table */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-900">
                  Category Matrix
                </h2>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Under
                  </span>
                  <span className="flex items-center gap-1 text-rose-500">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Over
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-xs text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-2 sticky left-0 bg-white z-10">
                        Category
                      </th>
                      {MONTH_NAMES_SHORT.map((m) => (
                        <th key={m} className="py-3 px-2 text-right">
                          {m}
                        </th>
                      ))}
                      <th className="py-3 px-3 text-right text-slate-900 font-black">
                        Total YTD
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {data.rows.map((row) => (
                      <tr key={row.category.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-2 font-bold text-slate-900 sticky left-0 bg-white z-10 flex items-center gap-2 whitespace-nowrap">
                          {ICON_MAP[row.category.icon] || <Package className="w-4 h-4" />}
                          <Link
                            href={`/category/${row.category.slug}?year=${year}`}
                            className="hover:underline"
                          >
                            {row.category.name}
                          </Link>
                        </td>
                        {row.months.map((val, idx) => {
                          const isOver = val > (row.category.defaultBudget || 999999);
                          return (
                            <td
                              key={idx}
                              className={`py-3 px-2 text-right font-mono text-[11px] ${
                                val === 0
                                  ? "text-slate-300"
                                  : isOver
                                  ? "text-rose-600 bg-rose-50/60 font-bold rounded"
                                  : "text-slate-800"
                              }`}
                            >
                              {val > 0 ? val.toFixed(0) : "-"}
                            </td>
                          );
                        })}
                        <td className="py-3 px-3 text-right font-black text-slate-900 font-mono">
                          {formatCurrency(row.annualTotal)}
                        </td>
                      </tr>
                    ))}

                    {/* Monthly Total Row */}
                    <tr className="border-t-2 border-slate-200 font-black">
                      <td className="py-3 px-2 sticky left-0 bg-white z-10 text-slate-900 uppercase tracking-wider text-[11px]">
                        Monthly Total
                      </td>
                      {data.monthlyExpenses.map((val, idx) => (
                        <td key={idx} className="py-3 px-2 text-right font-mono text-slate-900">
                          {val.toFixed(0)}
                        </td>
                      ))}
                      <td className="py-3 px-3 text-right font-mono text-emerald-600 text-sm">
                        {formatCurrency(data.totalAnnualExpenses)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <QuickEntryDrawer
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        categories={categories}
        defaultYear={year}
        onSuccess={() => loadAnnualData()}
      />

      <BottomNav onOpenQuickEntry={() => setIsQuickEntryOpen(true)} />
    </main>
  );
}
