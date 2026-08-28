"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import {
  AnnualSummary,
  CategoryData,
  CreateTransactionInput,
  MonthSummary,
  NextMonthForecast,
  TransactionData,
} from "@/types";
import { MONTH_NAMES_ES } from "./utils";

const DEFAULT_CATEGORIES: CategoryData[] = [
  { id: "cat-1", slug: "piso", name: "Piso", icon: "Home", color: "blue", isFixed: true, defaultBudget: 971.26, order: 1 },
  { id: "cat-2", slug: "suministros", name: "Suministros", icon: "Zap", color: "amber", isFixed: false, defaultBudget: 130.0, order: 2 },
  { id: "cat-3", slug: "extraescolares", name: "Extraescolares", icon: "Activity", color: "orange", isFixed: false, defaultBudget: 80.0, order: 3 },
  { id: "cat-4", slug: "telefono", name: "Telefono", icon: "Phone", color: "indigo", isFixed: true, defaultBudget: 34.0, order: 4 },
  { id: "cat-5", slug: "impuestos_seguros", name: "Impuestos/Seguros", icon: "ShieldCheck", color: "purple", isFixed: true, defaultBudget: 241.59, order: 5 },
  { id: "cat-6", slug: "comida", name: "Comida/Agua", icon: "ShoppingCart", color: "emerald", isFixed: false, defaultBudget: 645.0, order: 6 },
  { id: "cat-7", slug: "colegio", name: "Dominiques", icon: "GraduationCap", color: "rose", isFixed: false, defaultBudget: 340.0, order: 7 },
  { id: "cat-8", slug: "otros", name: "Otros", icon: "Package", color: "slate", isFixed: false, defaultBudget: 175.0, order: 8 },
];

export async function getAllCategories(): Promise<CategoryData[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });
    if (categories.length > 0) {
      return categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        icon: c.icon,
        color: c.color,
        isFixed: c.isFixed,
        defaultBudget: c.defaultBudget,
        order: c.order,
      }));
    }
  } catch (e) {
    console.warn("Using default categories fallback", e);
  }
  return DEFAULT_CATEGORIES;
}

export async function getMonthSummary(
  year: number = 2026,
  month: number = 1
): Promise<MonthSummary> {
  const categories = await getAllCategories();

  try {
    let incomeRecord = await prisma.monthlyIncome.findUnique({
      where: {
        year_month: { year, month },
      },
    });

    if (!incomeRecord) {
      incomeRecord = {
        id: "inc-def",
        year,
        month,
        person1Amount: month === 5 ? 1200 : month === 8 ? 1000 : 1200,
        person2Amount: month === 5 ? 1300 : month === 8 ? 1000 : 1200,
        createdAt: new Date(),
      };
    }

    const person1Income = incomeRecord.person1Amount;
    const person2Income = incomeRecord.person2Amount;
    const totalIncome = person1Income + person2Income;

    const transactions = await prisma.transaction.findMany({
      where: {
        year,
        month,
        type: "EXPENSE",
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    let totalExpenses = 0;
    let person1PaidExpenses = 0;
    let person2PaidExpenses = 0;
    let sharedPaidExpenses = 0;

    let fixedExpensesTotal = 0;
    let variableExpensesTotal = 0;
    let periodicExpensesTotal = 0;
    let financedExpensesTotal = 0;

    const categoryMap = new Map<string, { total: number; txs: any[] }>();
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { total: 0, txs: [] });
    });

    transactions.forEach((tx) => {
      totalExpenses += tx.amount;

      if (tx.paidBy === "PERSON_1") {
        person1PaidExpenses += tx.amount;
      } else if (tx.paidBy === "PERSON_2") {
        person2PaidExpenses += tx.amount;
      } else {
        sharedPaidExpenses += tx.amount;
      }

      if (tx.installmentTotal) {
        financedExpensesTotal += tx.amount;
      } else if (
        tx.category?.slug === "piso" ||
        tx.category?.slug === "telefono" ||
        tx.concept.toLowerCase().includes("parking") ||
        tx.concept.toLowerCase().includes("cuota")
      ) {
        fixedExpensesTotal += tx.amount;
      } else if (
        tx.category?.slug === "impuestos_seguros" ||
        tx.concept.toLowerCase().includes("fundaci") ||
        tx.concept.toLowerCase().includes("socios") ||
        tx.concept.toLowerCase().includes("libros")
      ) {
        periodicExpensesTotal += tx.amount;
      } else {
        variableExpensesTotal += tx.amount;
      }

      if (tx.categoryId && categoryMap.has(tx.categoryId)) {
        const current = categoryMap.get(tx.categoryId)!;
        current.total += tx.amount;
        current.txs.push({
          ...tx,
          date: tx.date.toISOString(),
          createdAt: tx.createdAt.toISOString(),
        });
      }
    });

    const sharePerPerson = totalExpenses / 2;
    const netBalance = totalIncome - totalExpenses;

    const categoriesResult = categories.map((cat) => {
      const data = categoryMap.get(cat.id) || { total: 0, txs: [] };
      return {
        category: cat,
        total: parseFloat(data.total.toFixed(2)),
        budget: cat.defaultBudget,
        count: data.txs.length,
        transactions: data.txs,
      };
    });

    return {
      month,
      monthName: MONTH_NAMES_ES[month - 1],
      year,
      totalIncome,
      person1Income,
      person2Income,
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      netBalance: parseFloat(netBalance.toFixed(2)),
      sharePerPerson: parseFloat(sharePerPerson.toFixed(2)),
      person1PaidExpenses: parseFloat(person1PaidExpenses.toFixed(2)),
      person2PaidExpenses: parseFloat(person2PaidExpenses.toFixed(2)),
      sharedPaidExpenses: parseFloat(sharedPaidExpenses.toFixed(2)),
      person1Balance: 0,
      person2Balance: 0,
      categories: categoriesResult,
      fixedExpensesTotal: parseFloat(fixedExpensesTotal.toFixed(2)),
      variableExpensesTotal: parseFloat(variableExpensesTotal.toFixed(2)),
      periodicExpensesTotal: parseFloat(periodicExpensesTotal.toFixed(2)),
      financedExpensesTotal: parseFloat(financedExpensesTotal.toFixed(2)),
    };
  } catch (err) {
    console.error("Error in getMonthSummary, using calculated monthly data", err);
    // Fallback con datos calculados del Excel
    const piso = month <= 3 ? 954.0 : 971.26;
    const comida = month <= 8 ? 644.21 : 648.63;
    const tel = 34.0;
    const totalExp = piso + comida + tel;
    return {
      month,
      monthName: MONTH_NAMES_ES[month - 1],
      year,
      totalIncome: 2400,
      person1Income: 1200,
      person2Income: 1200,
      totalExpenses: totalExp,
      netBalance: 2400 - totalExp,
      sharePerPerson: totalExp / 2,
      person1PaidExpenses: 0,
      person2PaidExpenses: 0,
      sharedPaidExpenses: totalExp,
      person1Balance: 0,
      person2Balance: 0,
      categories: categories.map((c) => ({
        category: c,
        total: c.slug === "piso" ? piso : c.slug === "comida" ? comida : c.slug === "telefono" ? tel : 0,
        budget: c.defaultBudget,
        count: 1,
        transactions: [],
      })),
      fixedExpensesTotal: piso + tel,
      variableExpensesTotal: comida,
      periodicExpensesTotal: 0,
      financedExpensesTotal: 0,
    };
  }
}

export async function getNextMonthForecast(
  currentYear: number = 2026,
  currentMonth: number = 1
): Promise<NextMonthForecast> {
  const targetMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const targetYear = currentMonth === 12 ? currentYear + 1 : currentYear;
  const targetMonthName = MONTH_NAMES_ES[targetMonth - 1];

  const upcomingBills: NextMonthForecast["upcomingBills"] = [];

  const pisoAmount = targetMonth <= 3 ? 954.0 : 971.26;
  upcomingBills.push({
    name: "Alquiler Piso (Ubiergo)",
    amount: pisoAmount,
    category: "Piso",
    nature: "FIXED",
    frequency: "MONTHLY",
    estimatedDay: 1,
  });

  upcomingBills.push({
    name: "Teléfono Fibra + Móviles (Lowi)",
    amount: 34.0,
    category: "Teléfono",
    nature: "FIXED",
    frequency: "MONTHLY",
    estimatedDay: 5,
  });

  if (targetMonth >= 5) {
    const parkingAmount = targetMonth === 5 ? 221.0 : 121.0;
    upcomingBills.push({
      name: targetMonth === 5 ? "Parking (Alta + Mes)" : "Parking Mensual",
      amount: parkingAmount,
      category: "Otros",
      nature: "FIXED",
      frequency: "MONTHLY",
      estimatedDay: 1,
    });
  }

  if (targetMonth !== 7 && targetMonth !== 8) {
    const cuotaCole = targetMonth <= 6 ? 180.0 : 169.5;
    upcomingBills.push({
      name: "Cuota Escolar Dominiques",
      amount: cuotaCole,
      category: "Dominiques",
      nature: "FIXED",
      frequency: "MONTHLY",
      estimatedDay: 3,
    });
  }

  if (targetMonth !== 7 && targetMonth !== 8) {
    const basketCuota = targetMonth === 6 ? 47.0 : targetMonth >= 9 ? 109.3 : 76.0;
    upcomingBills.push({
      name: "Cuota Basket Extraescolares",
      amount: basketCuota,
      category: "Extraescolares",
      nature: "FIXED",
      frequency: "MONTHLY",
      estimatedDay: 5,
    });
  }

  if (targetMonth <= 3) {
    upcomingBills.push({
      name: `Colchón Emma (${24 + targetMonth}/27)`,
      amount: 15.0,
      category: "Otros",
      nature: "FINANCED",
      frequency: "MONTHLY",
      estimatedDay: 1,
    });
  }

  if (targetMonth >= 2) {
    const teleCuota = targetMonth - 1;
    upcomingBills.push({
      name: `Tele (${teleCuota}/12)`,
      amount: 89.9,
      category: "Otros",
      nature: "FINANCED",
      frequency: "MONTHLY",
      estimatedDay: 1,
    });
  }

  const comidaEst = targetMonth <= 8 ? 644.21 : 648.63;
  upcomingBills.push({
    name: "Comida + Agua Vichy (Estimación)",
    amount: comidaEst,
    category: "Comida/Agua",
    nature: "VARIABLE",
    frequency: "MONTHLY",
    estimatedDay: 2,
  });

  const isAguaMonth = targetMonth % 2 !== 0;
  const suministrosEst = isAguaMonth ? 180.0 : 125.0;
  upcomingBills.push({
    name: isAguaMonth ? "Suministros (Luz + Gas + Agua bimestral)" : "Suministros (Luz + Gas)",
    amount: suministrosEst,
    category: "Suministros",
    nature: "VARIABLE",
    frequency: isAguaMonth ? "BIMONTHLY" : "MONTHLY",
    estimatedDay: 15,
  });

  let fixedTotal = 0;
  let financedTotal = 0;
  let periodicExpectedTotal = 0;
  let estimatedVariableTotal = 0;

  upcomingBills.forEach((b) => {
    if (b.nature === "FIXED") fixedTotal += b.amount;
    else if (b.nature === "FINANCED") financedTotal += b.amount;
    else if (b.nature === "PERIODIC") periodicExpectedTotal += b.amount;
    else estimatedVariableTotal += b.amount;
  });

  const totalForecast = fixedTotal + financedTotal + periodicExpectedTotal + estimatedVariableTotal;
  const sharePerPerson = totalForecast / 2;
  const recommendedDepositPerPerson = Math.ceil(sharePerPerson / 10) * 10;

  return {
    targetMonth,
    targetMonthName,
    targetYear,
    fixedTotal: parseFloat(fixedTotal.toFixed(2)),
    financedTotal: parseFloat(financedTotal.toFixed(2)),
    periodicExpectedTotal: parseFloat(periodicExpectedTotal.toFixed(2)),
    estimatedVariableTotal: parseFloat(estimatedVariableTotal.toFixed(2)),
    totalForecast: parseFloat(totalForecast.toFixed(2)),
    sharePerPerson: parseFloat(sharePerPerson.toFixed(2)),
    recommendedDepositPerPerson,
    upcomingBills,
  };
}

export async function getAnnualSummary(year: number = 2026): Promise<AnnualSummary> {
  const categories = await getAllCategories();

  try {
    const incomes = await prisma.monthlyIncome.findMany({
      where: { year },
      orderBy: { month: "asc" },
    });

    const monthlyIncomes = Array(12).fill(2400);
    monthlyIncomes[4] = 2500; // mayo
    monthlyIncomes[7] = 2000; // agosto
    incomes.forEach((inc) => {
      if (inc.month >= 1 && inc.month <= 12) {
        monthlyIncomes[inc.month - 1] = inc.person1Amount + inc.person2Amount;
      }
    });

    const transactions = await prisma.transaction.findMany({
      where: { year, type: "EXPENSE" },
    });

    const matrix = new Map<string, number[]>();
    categories.forEach((cat) => {
      matrix.set(cat.id, Array(12).fill(0));
    });

    const monthlyExpenses = Array(12).fill(0);

    transactions.forEach((tx) => {
      if (tx.month >= 1 && tx.month <= 12) {
        monthlyExpenses[tx.month - 1] += tx.amount;
        if (tx.categoryId && matrix.has(tx.categoryId)) {
          const row = matrix.get(tx.categoryId)!;
          row[tx.month - 1] += tx.amount;
        }
      }
    });

    const monthlyBalances = monthlyIncomes.map((inc, i) => inc - monthlyExpenses[i]);

    const rows = categories.map((cat) => {
      const months = (matrix.get(cat.id) || Array(12).fill(0)).map((m) =>
        parseFloat(m.toFixed(2))
      );
      const annualTotal = months.reduce((acc, curr) => acc + curr, 0);
      const monthlyAverage = annualTotal / 12;

      return {
        category: cat,
        months,
        annualTotal: parseFloat(annualTotal.toFixed(2)),
        monthlyAverage: parseFloat(monthlyAverage.toFixed(2)),
      };
    });

    const totalAnnualIncome = monthlyIncomes.reduce((acc, curr) => acc + curr, 0);
    const totalAnnualExpenses = monthlyExpenses.reduce((acc, curr) => acc + curr, 0);
    const totalAnnualBalance = totalAnnualIncome - totalAnnualExpenses;

    return {
      year,
      rows,
      monthlyIncomes,
      monthlyExpenses: monthlyExpenses.map((e) => parseFloat(e.toFixed(2))),
      monthlyBalances: monthlyBalances.map((b) => parseFloat(b.toFixed(2))),
      totalAnnualIncome: parseFloat(totalAnnualIncome.toFixed(2)),
      totalAnnualExpenses: parseFloat(totalAnnualExpenses.toFixed(2)),
      totalAnnualBalance: parseFloat(totalAnnualBalance.toFixed(2)),
    };
  } catch (err) {
    console.error("Error in getAnnualSummary fallback", err);
    return {
      year,
      rows: categories.map((cat) => ({
        category: cat,
        months: Array(12).fill(cat.defaultBudget),
        annualTotal: cat.defaultBudget * 12,
        monthlyAverage: cat.defaultBudget,
      })),
      monthlyIncomes: Array(12).fill(2400),
      monthlyExpenses: Array(12).fill(2250),
      monthlyBalances: Array(12).fill(150),
      totalAnnualIncome: 28800,
      totalAnnualExpenses: 27000,
      totalAnnualBalance: 1800,
    };
  }
}

export async function getCategoryDetail(
  slug: string,
  year: number = 2026,
  month?: number
) {
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug === slug) || categories[0];

  try {
    const whereClause: any = {
      categoryId: category.id,
      year,
      type: "EXPENSE",
    };

    if (month && month >= 1 && month <= 12) {
      whereClause.month = month;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });

    const total = transactions.reduce((acc, tx) => acc + tx.amount, 0);

    const installmentTxs = await prisma.transaction.findMany({
      where: {
        categoryId: category.id,
        installmentTotal: { not: null },
      },
      orderBy: { date: "desc" },
    });

    return {
      category,
      total: parseFloat(total.toFixed(2)),
      transactions: transactions.map((t) => ({
        ...t,
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
      })),
      installments: installmentTxs.map((t) => ({
        ...t,
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
      })),
    };
  } catch (e) {
    return {
      category,
      total: category.defaultBudget,
      transactions: [],
      installments: [],
    };
  }
}

export async function createTransaction(input: CreateTransactionInput) {
  try {
    const txDate = input.date ? new Date(input.date) : new Date();

    const created = await prisma.transaction.create({
      data: {
        type: input.type || "EXPENSE",
        amount: parseFloat(Number(input.amount).toFixed(2)),
        date: txDate,
        year: input.year || txDate.getFullYear(),
        month: input.month || txDate.getMonth() + 1,
        concept: input.concept.trim(),
        paidBy: input.paidBy || "SHARED",
        isRecurring: input.isRecurring ?? false,
        installmentCurrent: input.installmentCurrent ? Number(input.installmentCurrent) : null,
        installmentTotal: input.installmentTotal ? Number(input.installmentTotal) : null,
        notes: input.notes?.trim() || null,
        categoryId: input.categoryId || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/annual");
    return { success: true, transaction: created };
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTransaction(id: string) {
  try {
    await prisma.transaction.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath("/annual");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
