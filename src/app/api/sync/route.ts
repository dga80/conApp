import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Items array is required" }, { status: 400 });
    }

    const created = [];
    for (const item of items) {
      const date = item.date ? new Date(item.date) : new Date();
      const res = await prisma.transaction.create({
        data: {
          type: item.type || "EXPENSE",
          amount: parseFloat(Number(item.amount).toFixed(2)),
          date,
          year: item.year || date.getFullYear(),
          month: item.month || date.getMonth() + 1,
          concept: item.concept,
          paidBy: item.paidBy || "SHARED",
          isRecurring: item.isRecurring || false,
          installmentCurrent: item.installmentCurrent ? Number(item.installmentCurrent) : null,
          installmentTotal: item.installmentTotal ? Number(item.installmentTotal) : null,
          notes: item.notes || null,
          categoryId: item.categoryId || null,
        },
      });
      created.push(res);
    }

    return NextResponse.json({ success: true, count: created.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
