"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="p-3 bg-rose-100 rounded-full text-rose-600">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">Ha ocurrido un problema</h2>
      <p className="text-xs text-slate-500 max-w-xs">{error.message || "Error al cargar la página"}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold flex items-center gap-2"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Reintentar</span>
      </button>
    </div>
  );
}
