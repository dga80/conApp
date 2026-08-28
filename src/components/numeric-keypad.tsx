"use client";

import React from "react";
import { Delete, Check } from "lucide-react";

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  className?: string;
}

export function NumericKeypad({ value, onChange, onSubmit, className = "" }: NumericKeypadProps) {
  const handlePress = (key: string) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(8);
    }

    if (key === "backspace") {
      if (value.length <= 1) {
        onChange("0");
      } else {
        onChange(value.slice(0, -1));
      }
      return;
    }

    if (key === "clear") {
      onChange("0");
      return;
    }

    if (key === ".") {
      if (value.includes(".")) return;
      onChange(value === "" || value === "0" ? "0." : value + ".");
      return;
    }

    // Limit decimal digits to 2
    if (value.includes(".")) {
      const parts = value.split(".");
      if (parts[1] && parts[1].length >= 2) return;
    }

    // Max 7 digits
    if (value.replace(".", "").length >= 7) return;

    if (value === "0") {
      onChange(key);
    } else {
      onChange(value + key);
    }
  };

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "backspace"],
  ];

  return (
    <div className={`w-full max-w-sm mx-auto grid grid-cols-3 gap-2 p-1 select-none ${className}`}>
      {keys.map((row, rIdx) =>
        row.map((key) => (
          <button
            key={`${rIdx}-${key}`}
            type="button"
            onClick={() => handlePress(key)}
            className={`h-14 sm:h-16 flex items-center justify-center text-xl sm:text-2xl font-semibold rounded-2xl transition-all duration-100 active:scale-95 active:bg-slate-200 dark:active:bg-slate-800 ${
              key === "backspace"
                ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                : "bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
            }`}
          >
            {key === "backspace" ? <Delete className="w-6 h-6" /> : key}
          </button>
        ))
      )}
    </div>
  );
}
