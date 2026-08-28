"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Home,
  Zap,
  Phone,
  ShieldCheck,
  ShoppingCart,
  GraduationCap,
  Activity,
  Package,
  Trash2,
} from "lucide-react";
import { getCategoryDetail, deleteTransaction } from "@/lib/actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BottomNav } from "@/components/bottom-nav";
import { QuickEntryDrawer } from "@/components/quick-entry-drawer";

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home className="w-6 h-6 text-slate-700" />,
  Zap: <Zap className="w-6 h-6 text-amber-500" />,
  Phone: <Phone className="w-6 h-6 text-indigo-500" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-purple-500" />,
  ShoppingCart: <ShoppingCart className="w-6 h-6 text-emerald-600" />,
  GraduationCap: <GraduationCap className="w-6 h-6 text-rose-500" />,
  Activity: <Activity className="w-6 h-6 text-orange-500" />,
  Package: <Package className="w-6 h-6 text-slate-500" />,
};

export default function CategoryDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const yearParam = searchParams.get("year") ? parseInt(searchParams.get("year")!) : 2026;
  const monthParam = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getCategoryDetail(slug, yearParam, monthParam);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug, yearParam, monthParam]);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este gasto?")) {
      await deleteTransaction(id);
      loadData();
    }
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 space-y-3 text-slate-400">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium">Cargando categoría...</span>
      </div>
    );
  }

  const { category, total, transactions } = data;

  return (
    <main className="flex-1 flex flex-col pb-24 bg-[#F8FAFC]">
      {/* Top Bar */}
      <header className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0 bg-[#F8FAFC]/95 backdrop-blur-xs z-30">
        <Link
          href="/"
          className="p-2 rounded-full text-slate-600 hover:bg-slate-200/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-xs font-extrabold text-slate-900 tracking-tight">
          {category.name} ({yearParam})
        </span>
        <div className="w-9" />
      </header>

      <div className="px-5 space-y-4 max-w-lg mx-auto w-full">
        {/* Category Header Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                {ICON_MAP[category.icon] || <Package className="w-6 h-6 text-slate-700" />}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  CATEGORÍA
                </span>
                <h1 className="text-xl font-black text-slate-900 leading-tight">
                  {category.name}
                </h1>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Gasto Total
              </span>
              <span className="text-2xl font-black text-slate-900">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Trend Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tendencia Trimestral
            </h3>
            <span className="text-[11px] font-bold text-emerald-600">
              {yearParam}
            </span>
          </div>

          <div className="flex items-end justify-between h-20 pt-2 px-2 gap-2">
            {["Q1", "Q2", "Q3", "Q4"].map((q, idx) => (
              <div key={q} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className="w-full bg-[#0F172A] rounded-lg transition-all"
                  style={{ height: `${25 + idx * 20}%` }}
                />
                <span className="text-[10px] font-bold text-slate-400">{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Transacciones Registradas ({transactions.length})
          </h2>

          {transactions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs font-medium border border-slate-200/80">
              No hay transacciones registradas en este período.
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-slate-900 block">
                      {tx.concept}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <span>{formatDate(tx.date)} {yearParam}</span>
                      {tx.installmentCurrent && tx.installmentTotal && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold">
                          Cuota {tx.installmentCurrent}/{tx.installmentTotal}
                        </span>
                      )}
                      {tx.isRecurring && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold">
                          Recurrente
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {formatCurrency(tx.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
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
        categories={[category]}
        defaultYear={yearParam}
        onSuccess={() => loadData()}
      />

      <BottomNav onOpenQuickEntry={() => setIsQuickEntryOpen(true)} />
    </main>
  );
}
