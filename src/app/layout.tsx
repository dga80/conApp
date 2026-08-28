import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finanzas Pro | HomeBudget 2026",
  description: "Sistema Minimalista de Control de Finanzas Compartidas 50/50 y Presupuesto Doméstico 2026.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finanzas Pro",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body className="h-full bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
