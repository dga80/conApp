import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || "dga80/conApp";

  if (!token) {
    return NextResponse.json({
      connected: false,
      repo,
      message: "Sin GITHUB_TOKEN en Netlify. Modo lectura desde data/budget-2026.json activo.",
    });
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        connected: true,
        repo: data.full_name,
        permissions: data.permissions,
        message: "Conexión con GitHub activa. Cada gasto guardará un commit en el repositorio.",
      });
    } else {
      return NextResponse.json({
        connected: false,
        repo,
        status: res.status,
        message: "Token de GitHub no válido o sin permisos de escritura.",
      });
    }
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      error: err.message,
    });
  }
}
