import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MONTH_NAMES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const MONTH_NAMES_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStrOrObj: string | Date): string {
  const d = new Date(dateStrOrObj);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(d);
}

export function getCategoryBadgeColor(color: string): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  switch (color) {
    case "blue":
      return {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-800",
        badge: "bg-blue-500 text-white",
      };
    case "amber":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/30",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-800",
        badge: "bg-amber-500 text-white",
      };
    case "indigo":
      return {
        bg: "bg-indigo-50 dark:bg-indigo-950/30",
        text: "text-indigo-600 dark:text-indigo-400",
        border: "border-indigo-200 dark:border-indigo-800",
        badge: "bg-indigo-500 text-white",
      };
    case "purple":
      return {
        bg: "bg-purple-50 dark:bg-purple-950/30",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-800",
        badge: "bg-purple-500 text-white",
      };
    case "emerald":
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-800",
        badge: "bg-emerald-500 text-white",
      };
    case "rose":
      return {
        bg: "bg-rose-50 dark:bg-rose-950/30",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-200 dark:border-rose-800",
        badge: "bg-rose-500 text-white",
      };
    case "orange":
      return {
        bg: "bg-orange-50 dark:bg-orange-950/30",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-200 dark:border-orange-800",
        badge: "bg-orange-500 text-white",
      };
    case "slate":
    default:
      return {
        bg: "bg-slate-50 dark:bg-slate-900/40",
        text: "text-slate-600 dark:text-slate-400",
        border: "border-slate-200 dark:border-slate-700",
        badge: "bg-slate-600 text-white",
      };
  }
}
