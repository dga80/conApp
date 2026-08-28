"use server";

import { revalidatePath } from "next/cache";
import {
  AnnualSummary,
  CategoryData,
  CreateTransactionInput,
  MonthSummary,
  NextMonthForecast,
  TransactionData,
} from "@/types";
import { MONTH_NAMES_ES } from "./utils";
import { getGitHubData, saveToGitHub, GitHubBudgetData } from "./github-db";

export async function getAllCategories(): Promise<CategoryData[]> {
  const { data } = await getGitHubData();
  return data.categories;
}

export async function getMonthSummary(
  year: number = 2026,
  month: number = 1
): Promise<MonthSummary> {
  const { data } = await getGitHubData();
  const categories = data.categories;

  const incomeInfo = data.incomes.find((inc) => inc.month === month) || {
    month,
    person1: 1200,
    person2: 1200,
  };

  const person1Income = incomeInfo.person1;
  const person2Income = incomeInfo.person2;
  const totalIncome = person1Income + person2Income;

  const transactions = data.transactions.filter(
    (tx) => tx.year === year && tx.month === month && tx.type === "EXPENSE"
  );

  let totalExpenses = 0;
  let person1PaidExpenses = 0;
  let person2PaidExpenses = 0;
  let sharedPaidExpenses = 0;

  let fixedExpensesTotal = 0;
  let variableExpensesTotal = 0;
  let periodicExpensesTotal = 0;
  let financedExpensesTotal = 0;

  const categoryMap = new Map<string, { total: number; txs: TransactionData[] }>();
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

    const catObj = categories.find((c) => c.id === tx.categoryId);

    if (tx.installmentTotal) {
      financedExpensesTotal += tx.amount;
    } else if (
      catObj?.slug === "piso" ||
      catObj?.slug === "telefono" ||
      tx.concept.toLowerCase().includes("parking") ||
      tx.concept.toLowerCase().includes("cuota")
    ) {
      fixedExpensesTotal += tx.amount;
    } else if (
      catObj?.slug === "impuestos_seguros" ||
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
        category: catObj,
      });
    }
  });

  const sharePerPerson = totalExpenses / 2;
  const netBalance = totalIncome - totalExpenses;

  const categoriesResult = categories.map((cat) => {
    const d = categoryMap.get(cat.id) || { total: 0, txs: [] };
    return {
      category: cat,
      total: parseFloat(d.total.toFixed(2)),
      budget: cat.defaultBudget,
      count: d.txs.length,
      transactions: d.txs,
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
  const { data } = await getGitHubData();
  const categories = data.categories;

  const monthlyIncomes = Array(12).fill(2400);
  data.incomes.forEach((inc) => {
    if (inc.month >= 1 && inc.month <= 12) {
      monthlyIncomes[inc.month - 1] = inc.person1 + inc.person2;
    }
  });

  const transactions = data.transactions.filter(
    (tx) => tx.year === year && tx.type === "EXPENSE"
  );

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
}

export async function getCategoryDetail(
  slug: string,
  year: number = 2026,
  month?: number
) {
  const { data } = await getGitHubData();
  const category = data.categories.find((c) => c.slug === slug) || data.categories[0];

  const transactions = data.transactions.filter((tx) => {
    const matchCat = tx.categoryId === category.id;
    const matchYear = tx.year === year;
    const matchMonth = month ? tx.month === month : true;
    return matchCat && matchYear && matchMonth && tx.type === "EXPENSE";
  });

  const total = transactions.reduce((acc, tx) => acc + tx.amount, 0);

  const installments = data.transactions.filter(
    (tx) => tx.categoryId === category.id && tx.installmentTotal !== null
  );

  return {
    category,
    total: parseFloat(total.toFixed(2)),
    transactions,
    installments,
  };
}

export async function createTransaction(input: CreateTransactionInput) {
  try {
    const { data } = await getGitHubData();
    const txDate = input.date ? new Date(input.date) : new Date();

    const newTx: TransactionData = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: input.type || "EXPENSE",
      amount: parseFloat(Number(input.amount).toFixed(2)),
      date: txDate.toISOString(),
      year: input.year || txDate.getFullYear(),
      month: input.month || txDate.getMonth() + 1,
      concept: input.concept.trim(),
      paidBy: input.paidBy || "SHARED",
      isRecurring: input.isRecurring ?? false,
      installmentCurrent: input.installmentCurrent ? Number(input.installmentCurrent) : null,
      installmentTotal: input.installmentTotal ? Number(input.installmentTotal) : null,
      notes: input.notes?.trim() || null,
      categoryId: input.categoryId || null,
      createdAt: new Date().toISOString(),
    };

    data.transactions.unshift(newTx);

    const saveRes = await saveToGitHub(
      data,
      `Añadido gasto: ${newTx.concept} (${newTx.amount}€)`
    );

    revalidatePath("/");
    revalidatePath("/annual");

    return { success: true, transaction: newTx, gitHubSaved: saveRes.success };
  } catch (error: any) {
    console.error("Error creating transaction in GitHub DB:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const { data } = await getGitHubData();
    const target = data.transactions.find((t) => t.id === id);
    data.transactions = data.transactions.filter((t) => t.id !== id);

    await saveToGitHub(
      data,
      `Eliminado gasto: ${target?.concept || id}`
    );

    revalidatePath("/");
    revalidatePath("/annual");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
