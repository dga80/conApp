"use client";

import React, { useState, useTransition } from "react";
import {
  X,
  Plus,
  Home,
  Zap,
  Phone,
  ShieldCheck,
  ShoppingCart,
  GraduationCap,
  Activity,
  Package,
  Calendar,
  CreditCard,
  User,
  Users,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { CategoryData, CreateTransactionInput, PaidBy } from "@/types";
import { createTransaction } from "@/lib/actions";
import { addToOfflineQueue } from "@/lib/offline-storage";

interface QuickEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryData[];
  defaultMonth?: number;
  defaultYear?: number;
  onSuccess?: () => void;
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

export function QuickEntryDrawer({
  isOpen,
  onClose,
  categories,
  defaultMonth = 1,
  defaultYear = 2026,
  onSuccess,
}: QuickEntryDrawerProps) {
  const [amount, setAmount] = useState<string>("0.00");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0]?.id || ""
  );
  const [concept, setConcept] = useState("");
  const [paidBy, setPaidBy] = useState<PaidBy>("SHARED");
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCurrent, setInstallmentCurrent] = useState("1");
  const [installmentTotal, setInstallmentTotal] = useState("12");
  const [date, setDate] = useState(
    new Date(defaultYear, defaultMonth - 1, new Date().getDate())
      .toISOString()
      .split("T")[0]
  );
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCategory = categories.find((c) => c.id === selectedCategory);

  const addPreset = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toFixed(2));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFeedback("Introduce un importe mayor a 0 €");
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    const payload: CreateTransactionInput = {
      type: "EXPENSE",
      amount: numAmount,
      date,
      year: parseInt(date.split("-")[0], 10),
      month: parseInt(date.split("-")[1], 10),
      concept: concept.trim() || currentCategory?.name || "Gasto",
      paidBy,
      installmentCurrent: isInstallment ? parseInt(installmentCurrent, 10) : null,
      installmentTotal: isInstallment ? parseInt(installmentTotal, 10) : null,
      categoryId: selectedCategory || null,
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      addToOfflineQueue(payload);
      setFeedback("Guardado en cola offline");
      setTimeout(() => {
        setFeedback(null);
        resetForm();
        onClose();
        if (onSuccess) onSuccess();
      }, 800);
      return;
    }

    startTransition(async () => {
      const res = await createTransaction(payload);
      if (res.success) {
        setFeedback("¡Gasto añadido!");
        setTimeout(() => {
          setFeedback(null);
          resetForm();
          onClose();
          if (onSuccess) onSuccess();
        }, 600);
      } else {
        setFeedback("Error: " + res.error);
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  };

  const resetForm = () => {
    setAmount("0.00");
    setConcept("");
    setIsInstallment(false);
    setInstallmentCurrent("1");
    setInstallmentTotal("12");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs transition-all duration-300">
      <div className="flex-1" onClick={onClose} />

      {/* Stitch Quick Entry Bottom Sheet */}
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-[32px] shadow-2xl border-t border-slate-200 p-6 space-y-5 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Top drag handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

        {/* Title Header */}
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
            NEW EXPENSE
          </span>

          {/* Large Amount Display */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className="text-3xl font-black text-slate-900">€</span>
            <input
              type="number"
              step="0.01"
              value={amount === "0.00" ? "" : amount}
              placeholder="0.00"
              onChange={handleAmountChange}
              className="text-4xl sm:text-5xl font-black text-slate-900 text-center w-48 focus:outline-none placeholder:text-slate-300"
              autoFocus
            />
          </div>
        </div>

        {/* Quick Amount Preset Chips (+5€, +10€, +50€) */}
        <div className="flex items-center justify-center gap-2">
          {[5, 10, 20, 50].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => addPreset(val)}
              className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-transform active:scale-95"
            >
              +{val}€
            </button>
          ))}
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Category Horizontal Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Category</span>
            <span className="text-emerald-600 lowercase font-medium">8 fijas</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    if (!concept) setConcept(cat.name);
                  }}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {ICON_MAP[cat.icon] || <Package className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-[10px] text-center max-w-[54px] truncate leading-tight ${
                      isSelected ? "font-bold text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {cat.name.split("/")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Concept / Description */}
        <div>
          <input
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Concepto (ej. Compra semanal, Factura luz...)"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Date Row (Stitch style) */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Fecha</span>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white px-3 py-1 rounded-xl text-xs font-bold text-slate-800 border border-slate-200 focus:outline-none"
          />
        </div>

        {/* Gasto Fraccionado / Financiación Row (Stitch style) */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <CreditCard className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Gasto Fraccionado
                </span>
                <span className="text-[10px] text-slate-400">
                  Cuotas financiadas (ej. 3/12)
                </span>
              </div>
            </div>

            {/* iOS Switch Toggle */}
            <button
              type="button"
              onClick={() => setIsInstallment(!isInstallment)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                isInstallment ? "bg-emerald-500" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isInstallment ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {isInstallment && (
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                  Cuota Actual
                </span>
                <input
                  type="number"
                  min="1"
                  value={installmentCurrent}
                  onChange={(e) => setInstallmentCurrent(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-1 px-2 text-center text-xs font-bold"
                />
              </div>
              <span className="text-sm font-bold text-slate-400 mt-3">/</span>
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                  Total Cuotas
                </span>
                <input
                  type="number"
                  min="1"
                  value={installmentTotal}
                  onChange={(e) => setInstallmentTotal(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-1 px-2 text-center text-xs font-bold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Primary Dark Button: Stitch "Add Entry" */}
        <button
          type="button"
          disabled={isPending || parseFloat(amount) <= 0}
          onClick={() => handleSubmit()}
          className="w-full py-4 bg-[#0F172A] hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xl active:scale-[0.99] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isPending ? "Añadiendo..." : "Add Entry"}</span>
        </button>
      </div>
    </div>
  );
}
