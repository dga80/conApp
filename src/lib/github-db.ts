import { CategoryData, CreateTransactionInput, MonthSummary, TransactionData } from "@/types";
import { MONTH_NAMES_ES } from "./utils";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || "dga80/conApp";
const FILE_PATH = "data/budget-2026.json";

export interface GitHubBudgetData {
  year: number;
  categories: CategoryData[];
  incomes: { month: number; person1: number; person2: number }[];
  transactions: TransactionData[];
  lastUpdated: string;
}

export async function getGitHubData(): Promise<{ data: GitHubBudgetData; sha?: string }> {
  if (!GITHUB_TOKEN) {
    // Si no hay token configurado, cargar el archivo local estático
    try {
      const fs = await import("fs");
      const path = await import("path");
      const localPath = path.join(process.cwd(), FILE_PATH);
      if (fs.existsSync(localPath)) {
        const raw = fs.readFileSync(localPath, "utf-8");
        return { data: JSON.parse(raw) };
      }
    } catch (e) {
      console.warn("Could not read local file, using fallback", e);
    }
  }

  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 0 }, // no-cache para tener datos en tiempo real
    });

    if (!res.ok) {
      console.warn(`GitHub API returned ${res.status}, falling back`);
      return getLocalFallbackData();
    }

    const json = await res.json();
    const content = Buffer.from(json.content, "base64").toString("utf-8");
    return { data: JSON.parse(content), sha: json.sha };
  } catch (err) {
    console.error("Error fetching from GitHub API:", err);
    return getLocalFallbackData();
  }
}

export async function saveToGitHub(
  data: GitHubBudgetData,
  commitMessage: string
): Promise<{ success: boolean; error?: string }> {
  if (!GITHUB_TOKEN) {
    // Si no hay token en producción, guardar en archivo local si es posible
    try {
      const fs = await import("fs");
      const path = await import("path");
      const localPath = path.join(process.cwd(), FILE_PATH);
      data.lastUpdated = new Date().toISOString();
      fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: "GITHUB_TOKEN no está configurado en las variables de entorno." };
    }
  }

  try {
    const current = await getGitHubData();
    data.lastUpdated = new Date().toISOString();
    const contentEncoded = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const body: any = {
      message: `budget: ${commitMessage} [via HomeBudget PWA]`,
      content: contentEncoded,
    };

    if (current.sha) {
      body.sha = current.sha;
    }

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `GitHub API error: ${err}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

function getLocalFallbackData(): { data: GitHubBudgetData } {
  return {
    data: {
      year: 2026,
      categories: [
        { id: "cat-1", slug: "piso", name: "Piso", icon: "Home", color: "blue", isFixed: true, defaultBudget: 971.26, order: 1 },
        { id: "cat-2", slug: "suministros", name: "Suministros", icon: "Zap", color: "amber", isFixed: false, defaultBudget: 130.0, order: 2 },
        { id: "cat-3", slug: "extraescolares", name: "Extraescolares", icon: "Activity", color: "orange", isFixed: false, defaultBudget: 80.0, order: 3 },
        { id: "cat-4", slug: "telefono", name: "Telefono", icon: "Phone", color: "indigo", isFixed: true, defaultBudget: 34.0, order: 4 },
        { id: "cat-5", slug: "impuestos_seguros", name: "Impuestos/Seguros", icon: "ShieldCheck", color: "purple", isFixed: true, defaultBudget: 241.59, order: 5 },
        { id: "cat-6", slug: "comida", name: "Comida/Agua", icon: "ShoppingCart", color: "emerald", isFixed: false, defaultBudget: 645.0, order: 6 },
        { id: "cat-7", slug: "colegio", name: "Dominiques", icon: "GraduationCap", color: "rose", isFixed: false, defaultBudget: 340.0, order: 7 },
        { id: "cat-8", slug: "otros", name: "Otros", icon: "Package", color: "slate", isFixed: false, defaultBudget: 175.0, order: 8 },
      ],
      incomes: Array(12).fill(null).map((_, i) => ({
        month: i + 1,
        person1: i === 7 ? 1000 : 1200,
        person2: i === 4 ? 1300 : i === 7 ? 1000 : 1200,
      })),
      transactions: [],
      lastUpdated: new Date().toISOString(),
    },
  };
}
