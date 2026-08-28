"use client";

import React, { useState, useEffect } from "react";
import { Download, WifiOff, RefreshCw, Check } from "lucide-react";
import { syncOfflineQueue, getOfflineQueue } from "@/lib/offline-storage";

export function PWAInstaller() {
  const [isOffline, setIsOffline] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
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

    // Prompt de instalación PWA
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
    <>
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>Modo sin conexión. Los gastos se guardarán y sincronizarán luego.</span>
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
        <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 sticky top-0 z-50">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Sincronizando transacciones offline con el servidor...</span>
        </div>
      )}

      {/* Install PWA Prompt Banner */}
      {showInstallBanner && (
        <div className="mx-4 mb-3 p-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Instalar HomeBudget 2026</p>
              <p className="text-[10px] text-emerald-100">Acceso instantáneo desde tu pantalla de inicio</p>
            </div>
          </div>
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 bg-white text-emerald-700 text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-transform"
          >
            Instalar
          </button>
        </div>
      )}
    </>
  );
}
