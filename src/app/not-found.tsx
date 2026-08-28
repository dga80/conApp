import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <h2 className="text-2xl font-black text-slate-900">404</h2>
      <p className="text-xs text-slate-500">Página no encontrada</p>
      <Link
        href="/"
        className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Volver al inicio</span>
      </Link>
    </div>
  );
}
