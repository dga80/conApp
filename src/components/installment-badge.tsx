import React from "react";
import { CreditCard } from "lucide-react";

interface InstallmentBadgeProps {
  current: number;
  total: number;
  className?: string;
}

export function InstallmentBadge({ current, total, className = "" }: InstallmentBadgeProps) {
  const percentage = Math.min(100, Math.round((current / total) * 100));
  const remaining = total - current;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-500/20 ${className}`}>
      <CreditCard className="w-3.5 h-3.5" />
      <span>Cuota {current}/{total}</span>
      <span className="text-[10px] opacity-75">({remaining > 0 ? `${remaining} rest.` : 'Finalizada'})</span>
    </div>
  );
}
