"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Zap,
  Phone,
  ShieldCheck,
  ShoppingCart,
  GraduationCap,
  Activity,
  Package,
  Plus,
  Sparkles,
  TrendingUp,
  LayoutDashboard,
  Wallet,
  Receipt,
  Search,
} from "lucide-react";
import { getAllCategories, getMonthSummary, getNextMonthForecast } from "@/lib/actions";
import { CategoryData, MonthSummary, NextMonthForecast } from "@/types";
import { formatCurrency, formatDate, MONTH_NAMES_ES } from "@/lib/utils";
import { BottomNav } from "@/components/bottom-nav";
import { QuickEntryDrawer } from "@/components/quick-entry-drawer";
import { ForecastModal } from "@/components/forecast-modal";
import { PWAInstaller } from "@/components/pwa-installer";
import defaultBudgetData from "../../data/budget-2026.json";

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5 text-slate-700" />,
  Zap: <Zap className="w-5 h-5 text-emerald-600" />,
  Phone: <Phone className="w-5 h-5 text-indigo-500" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-rose-500" />,
  ShoppingCart: <ShoppingCart className="w-5 h-5 text-amber-600" />,
  GraduationCap: <GraduationCap className="w-5 h-5 text-purple-600" />,
  Activity: <Activity className="w-5 h-5 text-rose-500" />,
  Package: <Package className="w-5 h-5 text-slate-500" />,
};

function computeInitialSummary(month: number, year: number): MonthSummary {
  const categories = defaultBudgetData.categories as CategoryData[];
  const txs = defaultBudgetData.transactions.filter(
    (t: any) => t.month === month && t.year === year
  ) as any[];

  let totalExpenses = 0;
  const catMap = new Map<string, { total: number; txs: any[] }>();
  categories.forEach((c) => catMap.set(c.id, { total: 0, txs: [] }));

  txs.forEach((t) => {
    totalExpenses += t.amount;
    if (catMap.has(t.categoryId)) {
      const entry = catMap.get(t.categoryId)!;
      entry.total += t.amount;
      const catObj = categories.find((c) => c.id === t.categoryId);
      entry.txs.push({ ...t, category: catObj });
    }
  });

  const inc = defaultBudgetData.incomes.find((i) => i.month === month) || {
    person1: 1200,
    person2: 1200,
  };
  const totalIncome = inc.person1 + inc.person2;

  return {
    month,
    monthName: MONTH_NAMES_ES[month - 1],
    year,
    totalIncome,
    person1Income: inc.person1,
    person2Income: inc.person2,
    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
    netBalance: parseFloat((totalIncome - totalExpenses).toFixed(2)),
    sharePerPerson: parseFloat((totalExpenses / 2).toFixed(2)),
    person1PaidExpenses: 0,
    person2PaidExpenses: 0,
    sharedPaidExpenses: totalExpenses,
    person1Balance: 0,
    person2Balance: 0,
    categories: categories.map((c) => {
      const d = catMap.get(c.id) || { total: 0, txs: [] };
      return {
        category: c,
        total: parseFloat(d.total.toFixed(2)),
        budget: c.defaultBudget,
        count: d.txs.length,
        transactions: d.txs,
      };
    }),
    fixedExpensesTotal: 0,
    variableExpensesTotal: 0,
    periodicExpensesTotal: 0,
    financedExpensesTotal: 0,
  };
}

export default function HomeDashboardPage() {
  const currentMonthNum = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthNum);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  
  // Instant Initial State (Never null, never showing blocking blank spinner!)
  const [summary, setSummary] = useState<MonthSummary>(() =>
    computeInitialSummary(currentMonthNum, 2026)
  );
  const [forecast, setForecast] = useState<NextMonthForecast | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>(
    defaultBudgetData.categories as CategoryData[]
  );
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async (m: number = selectedMonth, y: number = selectedYear) => {
    try {
      const [sum, cats, fcast] = await Promise.all([
        getMonthSummary(y, m),
        getAllCategories(),
        getNextMonthForecast(y, m),
      ]);
      setSummary(sum);
      setCategories(cats);
      setForecast(fcast);
    } catch (e) {
      console.error("Error loading dashboard data", e);
      setSummary(computeInitialSummary(m, y));
    }
  };

  useEffect(() => {
    setSummary(computeInitialSummary(selectedMonth, selectedYear));
    loadData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const prevMonth = () => {
    if (selectedMonth > 1) setSelectedMonth(selectedMonth - 1);
  };
  const nextMonth = () => {
    if (selectedMonth < 12) setSelectedMonth(selectedMonth + 1);
  };

  const allTransactions = summary?.categories.flatMap((c) => c.transactions) || [];
  const filteredTransactions = allTransactions.filter((tx) =>
    tx.concept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row relative">
      <PWAInstaller />

      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR (Stitch "Finanzas Pro") */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 p-6 justify-between shrink-0 min-h-screen sticky top-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm shadow-md">
              CA
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 leading-tight">
                ContApp
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                Gestión Compartida 2026
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-[#A7F3D0]/60 text-[#065F46] font-bold text-xs transition-colors shadow-2xs"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Resumen</span>
            </Link>

            <Link
              href="/#budgets"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors"
            >
              <Wallet className="w-4 h-4" />
              <span>Presupuestos</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsQuickEntryOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors text-left"
            >
              <Receipt className="w-4 h-4" />
              <span>Gastos</span>
            </button>

            <Link
              href="/annual"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Tendencias</span>
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsForecastOpen(true)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors w-full text-left"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Previsión Fin de Mes</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT CONTAINER */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* DESKTOP TOP HEADER */}
        <header className="hidden lg:flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200/80 sticky top-0 z-20">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              GASTOS / CATEGORÍAS
            </span>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              {MONTH_NAMES_ES[selectedMonth - 1]} {selectedYear}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1 border border-slate-200">
              <button
                onClick={prevMonth}
                disabled={selectedMonth <= 1}
                className="p-1.5 rounded-xl hover:bg-white text-slate-600 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 px-2">
                {MONTH_NAMES_ES[selectedMonth - 1]}
              </span>
              <button
                onClick={nextMonth}
                disabled={selectedMonth >= 12}
                className="p-1.5 rounded-xl hover:bg-white text-slate-600 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsQuickEntryOpen(true)}
              className="px-4 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nueva Transacción</span>
            </button>
          </div>
        </header>

        {/* MOBILE TOP BAR */}
        <header className="lg:hidden px-5 pt-5 pb-3 flex items-center justify-between sticky top-0 bg-[#F8FAFC]/95 backdrop-blur-xs z-30">
          <button
            onClick={prevMonth}
            disabled={selectedMonth <= 1}
            className="p-2 rounded-full text-slate-600 hover:bg-slate-200/70 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
            {MONTH_NAMES_ES[selectedMonth - 1]} {selectedYear}
          </h1>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsForecastOpen(true)}
              className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Previsión Fin de Mes"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              disabled={selectedMonth >= 12}
              className="p-2 rounded-full text-slate-600 hover:bg-slate-200/70 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl w-full mx-auto pb-28 lg:pb-12">
          {/* ================================================================= */}
          {/* TOP CARDS ROW */}
          {/* ================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 1. Stitch Dark Balance Card */}
            <div className="bg-[#0F172A] text-white rounded-3xl p-6 shadow-lg space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Balance Total
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  {summary.netBalance >= 0 ? "● En Presupuesto" : "● Déficit"}
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {formatCurrency(summary.netBalance)}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div className="p-2 bg-slate-800/50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Ingresos</span>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    +{formatCurrency(summary.totalIncome)}
                  </span>
                </div>
                <div className="p-2 bg-slate-800/50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Gastos</span>
                  <span className="font-extrabold text-rose-400 text-sm">
                    -{formatCurrency(summary.totalExpenses)}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Stitch "Gasto por Persona" (50%) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  División de Gastos (50%)
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  Total / 2
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-[10px]">
                      P1
                    </div>
                    <span className="font-bold text-slate-800">Persona 1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">
                      {formatCurrency(summary.sharePerPerson)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Al día
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-[10px]">
                      P2
                    </div>
                    <span className="font-bold text-slate-800">Persona 2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">
                      {formatCurrency(summary.sharePerPerson)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Al día
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-100">
                <div className="w-1/2 bg-[#0F172A] h-full" />
                <div className="w-1/2 bg-[#10B981] h-full" />
              </div>
            </div>

            {/* 3. Stitch Previsión & Gasto Total */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Previsión Próximo Mes
                </span>
                <button
                  onClick={() => setIsForecastOpen(true)}
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <span>Ver Alerta</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-1">
                <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold block">
                  Transferir antes del día 1
                </span>
                <div className="text-2xl font-black text-emerald-950">
                  {formatCurrency(forecast?.sharePerPerson || summary.sharePerPerson)} / persona
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                <span>Gasto Total Mes Actual</span>
                <strong className="text-slate-900 font-bold">
                  {formatCurrency(summary.totalExpenses)}
                </strong>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* DESGLOSE POR CATEGORÍA */}
          {/* ================================================================= */}
          <div id="budgets" className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Desglose por Categoría ({summary.categories.length})
              </h2>
              <Link
                href="/annual"
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Ver Matriz Anual →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {summary.categories.map((item) => {
                const percent =
                  item.budget > 0
                    ? Math.min(100, Math.round((item.total / item.budget) * 100))
                    : item.total > 0
                    ? 100
                    : 0;

                return (
                  <Link
                    key={item.category.id}
                    href={`/category/${item.category.slug}?year=${selectedYear}&month=${selectedMonth}`}
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all active:scale-[0.99] flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          {ICON_MAP[item.category.icon] || (
                            <Package className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <span className="font-bold text-xs text-slate-900 leading-tight truncate max-w-[100px]">
                          {item.category.name}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900">
                        {formatCurrency(item.total)}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0F172A] h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>{percent}% consumido</span>
                        <span>{item.count} pagos</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ================================================================= */}
          {/* TRANSACCIONES DEL MES */}
          {/* ================================================================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Transacciones del Mes ({filteredTransactions.length})
              </h3>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                No se encontraron transacciones en este mes.
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">FECHA</th>
                      <th className="py-2.5 px-3">DESCRIPCIÓN</th>
                      <th className="py-2.5 px-3">PARTICIPANTES</th>
                      <th className="py-2.5 px-3">ESTADO</th>
                      <th className="py-2.5 px-3 text-right">MONTO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 text-slate-500 font-medium whitespace-nowrap">
                          {formatDate(tx.date)} {selectedYear}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">
                            {tx.concept}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {tx.category?.name || "Gasto"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center -space-x-1">
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                              P1
                            </div>
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                              P2
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            ● Liquidado
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-slate-900 font-mono">
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Forecast Modal */}
      <ForecastModal
        isOpen={isForecastOpen}
        onClose={() => setIsForecastOpen(false)}
        forecast={forecast}
      />

      {/* Stitch Quick Entry Drawer */}
      <QuickEntryDrawer
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        categories={categories}
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
        onSuccess={() => loadData(selectedMonth, selectedYear)}
      />

      {/* Stitch Mobile Bottom Nav */}
      <div className="lg:hidden">
        <BottomNav
          onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
          onOpenForecast={() => setIsForecastOpen(true)}
        />
      </div>
    </div>
  );
}
