"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Home,
  Zap,
  Phone,
  ShieldCheck,
  ShoppingCart,
  GraduationCap,
  Activity,
  Package,
  ArrowRight,
  Trash2,
  Repeat,
  CreditCard,
  User,
  Users,
  Lock,
  Shuffle,
  Calendar,
} from "lucide-react";
import { CategoryData, TransactionData } from "@/types";
import { formatCurrency, formatDate, getCategoryBadgeColor } from "@/lib/utils";
import { InstallmentBadge } from "./installment-badge";
import { deleteTransaction } from "@/lib/actions";
import { FilterType } from "./smart-nature-filters";

interface CategoryItem {
  category: CategoryData;
  total: number;
  budget: number;
  count: number;
  transactions: TransactionData[];
}

interface CategoryAccordionProps {
  categories: CategoryItem[];
  selectedMonth: number;
  selectedYear: number;
  currentFilter: FilterType;
  onRefresh?: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Phone: <Phone className="w-5 h-5" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  ShoppingCart: <ShoppingCart className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  Package: <Package className="w-5 h-5" />,
};

export function CategoryAccordion({
  categories,
  selectedMonth,
  selectedYear,
  currentFilter,
  onRefresh,
}: CategoryAccordionProps) {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleCategory = (id: string) => {
    setOpenCategoryId(openCategoryId === id ? null : id);
  };

  const handleDelete = (txId: string) => {
    if (confirm("¿Estás seguro de eliminar este movimiento?")) {
      startTransition(async () => {
        await deleteTransaction(txId);
        if (onRefresh) onRefresh();
      });
    }
  };

  // Filtrado según naturaleza
  const filteredCategories = categories.filter((item) => {
    if (currentFilter === "ALL") return true;

    if (currentFilter === "FIXED") {
      return (
        item.category.slug === "piso" ||
        item.category.slug === "telefono" ||
        item.transactions.some(
          (t) =>
            t.concept.toLowerCase().includes("parking") ||
            t.concept.toLowerCase().includes("cuota")
        )
      );
    }

    if (currentFilter === "VARIABLE") {
      return (
        item.category.slug === "comida" ||
        item.category.slug === "suministros" ||
        item.transactions.some((t) =>
          t.concept.toLowerCase().includes("comedor")
        )
      );
    }

    if (currentFilter === "PERIODIC") {
      return (
        item.category.slug === "impuestos_seguros" ||
        item.transactions.some(
          (t) =>
            t.concept.toLowerCase().includes("fundaci") ||
            t.concept.toLowerCase().includes("socios") ||
            t.concept.toLowerCase().includes("libros")
        )
      );
    }

    if (currentFilter === "FINANCED") {
      return item.transactions.some((t) => t.installmentTotal !== null);
    }

    return true;
  });

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Gastos del Mes ({filteredCategories.length} categorías)
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">
          {filteredCategories.reduce((a, c) => a + c.count, 0)} pagos registrados
        </span>
      </div>

      <div className="space-y-2">
        {filteredCategories.map((item) => {
          const isOpen = openCategoryId === item.category.id;
          const colorStyles = getCategoryBadgeColor(item.category.color);

          return (
            <div
              key={item.category.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs transition-all duration-200"
            >
              {/* Category Header Bar */}
              <button
                type="button"
                onClick={() => toggleCategory(item.category.id)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${colorStyles.bg} ${colorStyles.text} border ${colorStyles.border}`}
                  >
                    {ICON_MAP[item.category.icon] || <Package className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {item.category.name}
                      </span>
                      {item.category.isFixed ? (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Fijo
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <Shuffle className="w-2.5 h-2.5" /> Variable
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{item.count} movimientos</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                      {formatCurrency(item.total)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {(item.total / 2).toFixed(2)} € / pers.
                    </span>
                  </div>
                  <div className="text-slate-400">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Transactions List */}
              {isOpen && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2 bg-slate-50/50 dark:bg-slate-950/20">
                  {item.transactions.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-3">
                      No hay transacciones registradas en este mes.
                    </p>
                  ) : (
                    <div className="space-y-1.5 pt-1">
                      {item.transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs shadow-2xs"
                        >
                          <div className="space-y-1 pr-2">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                              <span>{tx.concept}</span>
                              {tx.isRecurring && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px]">
                                  <Repeat className="w-3 h-3" /> Fijo
                                </span>
                              )}
                              {tx.installmentCurrent && tx.installmentTotal && (
                                <InstallmentBadge
                                  current={tx.installmentCurrent}
                                  total={tx.installmentTotal}
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span>{formatDate(tx.date)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-400" />
                                <span>50% Cuenta Común</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                              {formatCurrency(tx.amount)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDelete(tx.id)}
                              disabled={isPending}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              title="Eliminar movimiento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Link to Category Detail */}
                  <div className="pt-2 flex justify-end">
                    <Link
                      href={`/category/${item.category.slug}?year=${selectedYear}&month=${selectedMonth}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <span>Ver histórico de {item.category.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
