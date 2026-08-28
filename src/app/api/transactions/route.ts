import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateTransactionInput } from "@/types";

export async function POST(request: Request) {
  try {
    const body: CreateTransactionInput = await request.json();

    const date = body.date ? new Date(body.date) : new Date();

    const created = await prisma.transaction.create({
      data: {
        type: body.type || "EXPENSE",
        amount: parseFloat(Number(body.amount).toFixed(2)),
        date,
        year: body.year || date.getFullYear(),
        month: body.month || date.getMonth() + 1,
        concept: body.concept,
        paidBy: body.paidBy || "SHARED",
        isRecurring: body.isRecurring || false,
        installmentCurrent: body.installmentCurrent ? Number(body.installmentCurrent) : null,
        installmentTotal: body.installmentTotal ? Number(body.installmentTotal) : null,
        notes: body.notes || null,
        categoryId: body.categoryId || null,
      },
    });

    return NextResponse.json({ success: true, transaction: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || "2026", 10);
  const month = searchParams.get("month") ? parseInt(searchParams.get("month")!, 10) : undefined;

  const whereClause: any = { year };
  if (month) whereClause.month = month;

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    include: { category: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions);
}
