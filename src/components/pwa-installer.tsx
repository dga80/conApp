"use client";

import React, { useState, useEffect } from "react";
import { Download, WifiOff, RefreshCw, X } from "lucide-react";
import { syncOfflineQueue, getOfflineQueue } from "@/lib/offline-storage";

export function PWAInstaller() {
  const [isOffline, setIsOffline] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registrado:", reg.scope))
        .catch((err) => console.log("SW error:", err));
    }

    const handleOnline = async () => {
      setIsOffline(false);
      setIsSyncing(true);
      const res = await syncOfflineQueue();
      setIsSyncing(false);
      setOfflineCount(getOfflineQueue().length);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setOfflineCount(getOfflineQueue().length);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOffline(!navigator.onLine);
    setOfflineCount(getOfflineQueue().length);

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm pointer-events-auto">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="mb-2 bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold rounded-2xl shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Modo sin conexión.</span>
          </div>
          {offlineCount > 0 && (
            <span className="bg-amber-900/20 px-2 py-0.5 rounded-full text-[10px]">
              {offlineCount} pendientes
            </span>
          )}
        </div>
      )}

      {/* Syncing Indicator */}
      {isSyncing && (
        <div className="mb-2 bg-emerald-600 text-white px-4 py-2 text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Sincronizando con el servidor...</span>
        </div>
      )}

      {/* Install PWA Prompt Banner as floating card */}
      {showInstallBanner && (
        <div className="p-3.5 bg-[#0F172A] text-white rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Instalar App</p>
              <p className="text-[10px] text-slate-400">Acceso rápido desde el móvil</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl active:scale-95 transition-transform"
            >
              Instalar
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
