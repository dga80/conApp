"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Home,
  Zap,
  Phone,
  ShieldCheck,
  ShoppingCart,
  GraduationCap,
  Activity,
  Package,
  Repeat,
  CreditCard,
  Trash2,
} from "lucide-react";
import { getCategoryDetail, deleteTransaction, getAllCategories } from "@/lib/actions";
import { formatCurrency, formatDate, MONTH_NAMES_ES } from "@/lib/utils";
import { BottomNav } from "@/components/bottom-nav";
import { QuickEntryDrawer } from "@/components/quick-entry-drawer";
import { CategoryData } from "@/types";

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5 text-slate-700" />,
  Zap: <Zap className="w-5 h-5 text-amber-500" />,
  Phone: <Phone className="w-5 h-5 text-indigo-500" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-purple-500" />,
  ShoppingCart: <ShoppingCart className="w-5 h-5 text-emerald-600" />,
  GraduationCap: <GraduationCap className="w-5 h-5 text-rose-500" />,
  Activity: <Activity className="w-5 h-5 text-orange-500" />,
  Package: <Package className="w-5 h-5 text-slate-500" />,
};

export default function CategoryDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const year = parseInt(searchParams.get("year") || "2026", 10);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return searchParams.get("month") ? parseInt(searchParams.get("month")!, 10) : 1;
  });

  const [data, setData] = useState<any>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [res, cats] = await Promise.all([
        getCategoryDetail(slug, year, selectedMonth),
        getAllCategories(),
      ]);
      setData(res);
      setCategories(cats);
    } catch (e) {
      console.error("Error loading category detail", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug, year, selectedMonth]);

  const handleDelete = (txId: string) => {
    if (confirm("¿Estás seguro de eliminar este movimiento?")) {
      startTransition(async () => {
        await deleteTransaction(txId);
        loadData();
      });
    }
  };

  if (isLoading || !data) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center py-24 text-slate-400 bg-[#F8FAFC]">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium mt-3">Cargando categoría...</span>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col pb-24 bg-[#F8FAFC]">
      {/* Stitch Header with Month Arrows */}
      <header className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0 bg-[#F8FAFC]/95 backdrop-blur-xs z-30">
        <Link
          href="/"
          className="p-2 rounded-full text-slate-600 hover:bg-slate-200/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <h1 className="text-base font-bold text-slate-900 tracking-tight">
          {MONTH_NAMES_ES[selectedMonth - 1]} {year}
        </h1>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedMonth(Math.max(1, selectedMonth - 1))}
            disabled={selectedMonth <= 1}
            className="p-1.5 rounded-full text-slate-600 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedMonth(Math.min(12, selectedMonth + 1))}
            disabled={selectedMonth >= 12}
            className="p-1.5 rounded-full text-slate-600 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="px-5 space-y-4">
        {/* Stitch Category Header Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            {ICON_MAP[data.category.icon] || <Package className="w-4 h-4" />}
            <span>CATEGORY</span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {data.category.name}
            </h2>
            <div className="mt-2 space-y-0.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Spent
              </span>
              <span className="text-3xl font-extrabold text-slate-900 block">
                {formatCurrency(data.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Stitch Monthly Trend Card (Bar Chart) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <span className="text-xs font-bold text-slate-900 block">
            Monthly Trend
          </span>

          <div className="h-28 flex items-end justify-between gap-3 pt-2 px-2">
            {[40, 65, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className={`w-full rounded-lg transition-all ${
                    i === 3 ? "bg-[#0F172A]" : "bg-slate-200"
                  }`}
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] font-semibold text-slate-400">
                  {i === 0 ? "T1" : i === 1 ? "T2" : i === 2 ? "T3" : "T4"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stitch Transactions Section */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider px-1 block">
            Transactions ({data.transactions.length})
          </span>

          {data.transactions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs">
              No hay movimientos en este periodo.
            </div>
          ) : (
            <div className="space-y-2">
              {data.transactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                      {tx.concept.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-slate-900 block leading-tight">
                        {tx.concept}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                        <span>{formatDate(tx.date)}</span>
                        {tx.installmentCurrent && tx.installmentTotal && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            Installment {tx.installmentCurrent}/{tx.installmentTotal}
                          </span>
                        )}
                        {tx.isRecurring && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 whitespace-nowrap">
                      -{formatCurrency(tx.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(tx.id)}
                      disabled={isPending}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <QuickEntryDrawer
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        categories={categories}
        defaultMonth={selectedMonth}
        defaultYear={year}
        onSuccess={() => loadData()}
      />

      <BottomNav onOpenQuickEntry={() => setIsQuickEntryOpen(true)} />
    </main>
  );
}
