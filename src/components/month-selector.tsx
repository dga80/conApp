"use client";

import React, { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { MONTH_NAMES_ES, MONTH_NAMES_SHORT } from "@/lib/utils";

interface MonthSelectorProps {
  currentMonth: number;
  currentYear: number;
  onSelectMonth: (month: number) => void;
}

export function MonthSelector({
  currentMonth,
  currentYear,
  onSelectMonth,
}: MonthSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const prevMonth = () => {
    if (currentMonth > 1) onSelectMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth < 12) onSelectMonth(currentMonth + 1);
  };

  useEffect(() => {
    if (scrollRef.current) {
      const activeBtn = scrollRef.current.children[currentMonth - 1] as HTMLElement;
      if (activeBtn) {
        scrollRef.current.scrollTo({
          left: activeBtn.offsetLeft - scrollRef.current.clientWidth / 2 + activeBtn.clientWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [currentMonth]);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-2.5 px-3 sticky top-0 z-30 shadow-xs">
      {/* Header with year and arrows */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          <span>Presupuesto {currentYear}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            disabled={currentMonth <= 1}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[70px] text-center">
            {MONTH_NAMES_ES[currentMonth - 1]}
          </span>
          <button
            onClick={nextMonth}
            disabled={currentMonth >= 12}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal smooth scrolling month tabs */}
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
      >
        {MONTH_NAMES_SHORT.map((name, index) => {
          const monthNum = index + 1;
          const isActive = currentMonth === monthNum;
          return (
            <button
              key={monthNum}
              onClick={() => onSelectMonth(monthNum)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all active:scale-95 ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
