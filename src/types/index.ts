export type TransactionType = "EXPENSE" | "INCOME";
export type PaidBy = "PERSON_1" | "PERSON_2" | "SHARED";
export type ExpenseNature = "FIXED" | "VARIABLE" | "PERIODIC" | "FINANCED";
export type FrequencyType = "MONTHLY" | "BIMONTHLY" | "SEMIANNUAL" | "ANNUAL" | "SPORADIC";

export interface CategoryData {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  isFixed: boolean;
  defaultBudget: number;
  order: number;
}

export interface TransactionData {
  id: string;
  type: TransactionType;
  amount: number;
  date: string | Date;
  year: number;
  month: number;
  concept: string;
  paidBy: PaidBy;
  isRecurring: boolean;
  installmentCurrent?: number | null;
  installmentTotal?: number | null;
  notes?: string | null;
  categoryId?: string | null;
  category?: CategoryData | null;
  createdAt?: string | Date;
}

export interface MonthSummary {
  month: number;
  monthName: string;
  year: number;
  totalIncome: number;
  person1Income: number;
  person2Income: number;
  totalExpenses: number;
  netBalance: number;
  sharePerPerson: number;
  person1PaidExpenses: number;
  person2PaidExpenses: number;
  sharedPaidExpenses: number;
  person1Balance: number;
  person2Balance: number;
  categories: {
    category: CategoryData;
    total: number;
    budget: number;
    count: number;
    transactions: TransactionData[];
  }[];
  // Desglose por naturaleza de gasto
  fixedExpensesTotal: number;
  variableExpensesTotal: number;
  periodicExpensesTotal: number;
  financedExpensesTotal: number;
}

export interface NextMonthForecast {
  targetMonth: number;
  targetMonthName: string;
  targetYear: number;
  fixedTotal: number;
  estimatedVariableTotal: number;
  periodicExpectedTotal: number;
  financedTotal: number;
  totalForecast: number;
  sharePerPerson: number;
  recommendedDepositPerPerson: number;
  upcomingBills: {
    name: string;
    amount: number;
    category: string;
    nature: ExpenseNature;
    frequency: FrequencyType;
    estimatedDay?: number;
  }[];
}

export interface AnnualMatrixRow {
  category: CategoryData;
  months: number[];
  annualTotal: number;
  monthlyAverage: number;
}

export interface AnnualSummary {
  year: number;
  rows: AnnualMatrixRow[];
  monthlyIncomes: number[];
  monthlyExpenses: number[];
  monthlyBalances: number[];
  totalAnnualIncome: number;
  totalAnnualExpenses: number;
  totalAnnualBalance: number;
}

export interface CreateTransactionInput {
  type?: TransactionType;
  amount: number;
  date?: string;
  year: number;
  month: number;
  concept: string;
  paidBy: PaidBy;
  isRecurring?: boolean;
  installmentCurrent?: number | null;
  installmentTotal?: number | null;
  notes?: string | null;
  categoryId?: string | null;
}
