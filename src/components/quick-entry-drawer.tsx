"use client";

import React, { useState, useEffect } from "react";
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
  Calendar as CalendarIcon,
  Layers,
  Sparkles,
} from "lucide-react";
import { CategoryData, CreateTransactionInput } from "@/types";
import { createTransaction } from "@/lib/actions";
import { addToOfflineQueue } from "@/lib/offline-storage";
import { MONTH_NAMES_ES } from "@/lib/utils";

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

interface QuickEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryData[];
  defaultMonth?: number;
  defaultYear?: number;
  onSuccess?: () => void;
}

export function QuickEntryDrawer({
  isOpen,
  onClose,
  categories,
  defaultMonth,
  defaultYear,
  onSuccess,
}: QuickEntryDrawerProps) {
  const [amount, setAmount] = useState<string>("");
  const [concept, setConcept] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [paidBy, setPaidBy] = useState<"PERSON_1" | "PERSON_2" | "SHARED">("SHARED");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [isFinanced, setIsFinanced] = useState<boolean>(false);
  const [currentInstallment, setCurrentInstallment] = useState<string>("1");
  const [totalInstallments, setTotalInstallments] = useState<string>("12");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  if (!isOpen) return null;

  const handleAddAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    setIsSubmitting(true);

    const inputDate = new Date(date);
    const input: CreateTransactionInput = {
      type: "EXPENSE",
      amount: parsedAmount,
      concept: concept.trim() || "Gasto común",
      categoryId: selectedCategory,
      paidBy: paidBy,
      date: date,
      year: inputDate.getFullYear(),
      month: inputDate.getMonth() + 1,
      isRecurring: false,
      installmentCurrent: isFinanced ? parseInt(currentInstallment) : undefined,
      installmentTotal: isFinanced ? parseInt(totalInstallments) : undefined,
    };

    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        addToOfflineQueue(input);
      } else {
        await createTransaction(input);
      }
      setAmount("");
      setConcept("");
      setIsFinanced(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error creating transaction", err);
      addToOfflineQueue(input);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end items-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="flex-1 w-full" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1" />

        {/* Top Header */}
        <div className="px-6 py-2 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            NUEVO GASTO
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          {/* Big Amount Display */}
          <div className="text-center py-2">
            <div className="inline-flex items-center justify-center gap-1">
              <span className="text-3xl font-light text-slate-400">€</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="text-4xl sm:text-5xl font-black text-slate-900 w-48 text-center bg-transparent border-b-2 border-slate-100 focus:border-slate-900 focus:outline-none tracking-tight"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex justify-center gap-2 mt-3">
              {[5, 10, 20, 50].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddAmount(val)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full active:scale-95 transition-all"
                >
                  +{val}€
                </button>
              ))}
            </div>
          </div>

          {/* Concept Description Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Concepto / Descripción
            </label>
            <input
              type="text"
              placeholder="Ej: Compra Mercadona, Farmacia..."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Category Horizontal Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Categoría
            </label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl min-w-[70px] shrink-0 border transition-all ${
                      isSelected
                        ? "bg-[#0F172A] text-white border-[#0F172A] shadow-md scale-105"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20">
                      {ICON_MAP[cat.icon] || <Package className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] font-bold truncate max-w-[60px]">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paid By Selection (Reparto 50/50 o Persona) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pagado Por
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaidBy("SHARED")}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  paidBy === "SHARED"
                    ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Común 50/50
              </button>
              <button
                type="button"
                onClick={() => setPaidBy("PERSON_1")}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  paidBy === "PERSON_1"
                    ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Persona 1
              </button>
              <button
                type="button"
                onClick={() => setPaidBy("PERSON_2")}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  paidBy === "PERSON_2"
                    ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Persona 2
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Fecha
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Gasto Fraccionado / Financiación (Stitch Switch) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800">
                  Gasto Fraccionado / Cuota
                </span>
              </div>
              <input
                type="checkbox"
                checked={isFinanced}
                onChange={(e) => setIsFinanced(e.target.checked)}
                className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
              />
            </div>

            {isFinanced && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 animate-in fade-in">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">
                    Cuota Actual
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={currentInstallment}
                    onChange={(e) => setCurrentInstallment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">
                    Total Cuotas
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className="w-full py-4 bg-[#0F172A] hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold rounded-2xl text-sm shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? "Guardando..." : "Añadir Gasto"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
