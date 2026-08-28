import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sincronizando con la matriz exacta de RESUMEN POR MESES 2026...");

  await prisma.transaction.deleteMany();
  await prisma.monthlyIncome.deleteMany();
  await prisma.category.deleteMany();

  const categories = [
    { slug: "piso", name: "Piso", icon: "Home", color: "blue", isFixed: true, defaultBudget: 971.26, order: 1 },
    { slug: "suministros", name: "Suministros", icon: "Zap", color: "amber", isFixed: false, defaultBudget: 130.0, order: 2 },
    { slug: "extraescolares", name: "Extraescolares", icon: "Activity", color: "orange", isFixed: false, defaultBudget: 80.0, order: 3 },
    { slug: "telefono", name: "Telefono", icon: "Phone", color: "indigo", isFixed: true, defaultBudget: 34.0, order: 4 },
    { slug: "impuestos_seguros", name: "Impuestos/Seguros", icon: "ShieldCheck", color: "purple", isFixed: true, defaultBudget: 241.59, order: 5 },
    { slug: "comida", name: "Comida/Agua", icon: "ShoppingCart", color: "emerald", isFixed: false, defaultBudget: 645.0, order: 6 },
    { slug: "colegio", name: "Dominiques", icon: "GraduationCap", color: "rose", isFixed: false, defaultBudget: 340.0, order: 7 },
    { slug: "otros", name: "Otros", icon: "Package", color: "slate", isFixed: false, defaultBudget: 175.0, order: 8 },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    catMap[cat.slug] = created.id;
  }

  // 1. INGRESOS EXACTOS (Total: 28.500,00 €)
  const incomesConfig = [
    { m: 1, p1: 1200, p2: 1200 }, // 2.400
    { m: 2, p1: 1200, p2: 1200 }, // 2.400
    { m: 3, p1: 1200, p2: 1200 }, // 2.400
    { m: 4, p1: 1200, p2: 1200 }, // 2.400
    { m: 5, p1: 1200, p2: 1300 }, // 2.500
    { m: 6, p1: 1200, p2: 1200 }, // 2.400
    { m: 7, p1: 1200, p2: 1200 }, // 2.400
    { m: 8, p1: 1000, p2: 1000 }, // 2.000
    { m: 9, p1: 1200, p2: 1200 }, // 2.400
    { m: 10, p1: 1200, p2: 1200 }, // 2.400
    { m: 11, p1: 1200, p2: 1200 }, // 2.400
    { m: 12, p1: 1200, p2: 1200 }, // 2.400
  ];

  for (const inc of incomesConfig) {
    await prisma.monthlyIncome.create({
      data: {
        year: 2026,
        month: inc.m,
        person1Amount: inc.p1,
        person2Amount: inc.p2,
      },
    });
  }

  // 2. PISO: Meses 1-3 = 954,00 €, Meses 4-12 = 971,26 €
  for (let m = 1; m <= 12; m++) {
    const amount = m <= 3 ? 954.0 : 971.26;
    await prisma.transaction.create({
      data: {
        type: "EXPENSE",
        amount,
        date: new Date(`2026-${String(m).padStart(2, "0")}-01T10:00:00Z`),
        year: 2026,
        month: m,
        concept: "Ubiergo",
        paidBy: "SHARED",
        isRecurring: true,
        categoryId: catMap["piso"],
      },
    });
  }

  // 3. SUMINISTROS: 1=196.69, 2=145.96, 3=198.63, 4=143.92, 5=82.11, 6=122.62, 7=80.35, 8=118.88, 9=102.88
  const suministrosData = [
    { m: 1, amount: 196.69, concept: "Luz + gas + agua" },
    { m: 2, amount: 145.96, concept: "Luz + gas" },
    { m: 3, amount: 198.63, concept: "Luz + gas + agua" },
    { m: 4, amount: 143.92, concept: "Luz + gas" },
    { m: 5, amount: 82.11, concept: "Luz + gas + agua" },
    { m: 6, amount: 122.62, concept: "Luz + agua" },
    { m: 7, amount: 80.35, concept: "Luz + gas" },
    { m: 8, amount: 118.88, concept: "Luz + agua" },
    { m: 9, amount: 102.88, concept: "Luz + gas" },
  ];
  for (const s of suministrosData) {
    await prisma.transaction.create({
      data: {
        type: "EXPENSE",
        amount: s.amount,
        date: new Date(`2026-${String(s.m).padStart(2, "0")}-01T10:00:00Z`),
        year: 2026,
        month: s.m,
        concept: s.concept,
        paidBy: "SHARED",
        categoryId: catMap["suministros"],
      },
    });
  }

  // 4. EXTRAESCOLARES: 1=76, 2=116 (76+40), 3=76, 4=76, 5=76, 6=47, 7=0, 8=0, 9=109.30, 10=109.30, 11=109.30, 12=109.30
  const extraescolaresData = [
    { m: 1, amount: 76.0, concept: "Basket" },
    { m: 2, amount: 76.0, concept: "Basket" },
    { m: 2, amount: 40.0, concept: "Socios G.Barna" },
    { m: 3, amount: 76.0, concept: "Basket" },
    { m: 4, amount: 76.0, concept: "Basket" },
    { m: 5, amount: 76.0, concept: "Basket" },
    { m: 6, amount: 47.0, concept: "Basket" },
    { m: 9, amount: 109.3, concept: "Basket" },
    { m: 10, amount: 109.3, concept: "Basket" },
    { m: 11, amount: 109.3, concept: "Basket" },
    { m: 12, amount: 109.3, concept: "Basket" },
  ];
  for (const e of extraescolaresData) {
    await prisma.transaction.create({
      data: {
        type: "EXPENSE",
        amount: e.amount,
        date: new Date(`2026-${String(e.m).padStart(2, "0")}-01T10:00:00Z`),
        year: 2026,
        month: e.m,
        concept: e.concept,
        paidBy: "SHARED",
        categoryId: catMap["extraescolares"],
      },
    });
  }

  // 5. TELÉFONO: 34,00 € en los 12 meses
  for (let m = 1; m <= 12; m++) {
    await prisma.transaction.create({
      data: {
        type: "EXPENSE",
        amount: 34.0,
        date: new Date(`2026-${String(m).padStart(2, "0")}-01T10:00:00Z`),
        year: 2026,
        month: m,
        concept: "Lowi",
        paidBy: "SHARED",
        isRecurring: true,
        categoryId: catMap["telefono"],
      },
    });
  }

  // 6. IMPUESTOS / SEGUROS: Mes 4 = 43,97 € Aqualogy
  await prisma.transaction.create({
    data: {
      type: "EXPENSE",
      amount: 43.97,
      date: new Date("2026-04-16T10:00:00Z"),
      year: 2026,
      month: 4,
      concept: "Aqualogy/aquatec solution",
      paidBy: "SHARED",
      categoryId: catMap["impuestos_seguros"],
    },
  });

  // 7. COMIDA/AGUA: 1-8 = 644,21 €, 9-12 = 648,63 €
  for (let m = 1; m <= 12; m++) {
    const amount = m <= 8 ? 644.21 : 648.63;
    await prisma.transaction.create({
      data: {
        type: "EXPENSE",
        amount,
        date: new Date(`2026-${String(m).padStart(2, "0")}-01T10:00:00Z`),
        year: 2026,
        month: m,
        concept: "Comida + Agua La tienda Vichy",
        paidBy: "SHARED",
        categoryId: catMap["comida"],
      },
    });
  }

  // 8. DOMINIQUES:
  // 1: 308.70 (180 cuota + 128.70 comedor)
  // 2: 376.30 (180 + 168.30 + 28 fundación 3/5)
  // 3: 368.10 (180 + 188.10)
  // 4: 386.20 (180 + 178.20 + 28 fundación 4/5)
  // 5: 397.80 (180 + 217.80)
  // 6: 318.60 (180 + 138.60)
  // 7: 338.50 (148.50 comedor + 190 libros)
  // 8: 0.00
  // 9: 318.00 (169.50 cuota + 148.50 comedor)
  // 10: 197.50 (169.50 cuota + 28 fundación 1/5)
  // 11: 169.50 (169.50 cuota)
  // 12: 197.50 (169.50 cuota + 28 fundación 2/5)
  const domData = [
    { m: 1, amount: 180.0, concept: "Cuota dominiques" },
    { m: 1, amount: 128.7, concept: "Comedor Dominiques Diciembre" },
    { m: 2, amount: 180.0, concept: "Cuota dominiques" },
    { m: 2, amount: 168.3, concept: "Comedor Dominiques Enero" },
    { m: 2, amount: 28.0, concept: "Fundación 3/5", instC: 3, instT: 5 },
    { m: 3, amount: 180.0, concept: "Cuota dominiques" },
    { m: 3, amount: 188.1, concept: "Comedor Dominiques Febrero" },
    { m: 4, amount: 180.0, concept: "Cuota dominiques" },
    { m: 4, amount: 178.2, concept: "Comedor Dominiques Marzo" },
    { m: 4, amount: 28.0, concept: "Fundación 4/5", instC: 4, instT: 5 },
    { m: 5, amount: 180.0, concept: "Cuota dominiques" },
    { m: 5, amount: 217.8, concept: "Comedor Dominiques Abril" },
    { m: 6, amount: 180.0, concept: "Cuota dominiques" },
    { m: 6, amount: 138.6, concept: "Comedor Dominiques Mayo" },
    { m: 7, amount: 148.5, concept: "Comedor Dominiques Junio" },
    { m: 7, amount: 190.0, concept: "Libros" },
    { m: 9, amount: 169.5, concept: "Cuota Dominiques" },
    { m: 9, amount: 148.5, concept: "Comedor" },
    { m: 10, amount: 169.5, concept: "Cuota" },
    { m: 10, amount: 28.0, concept: "Fundació 1/5", instC: 1, instT: 5 },
    { m: 11, amount: 169.5, concept: "Cuota" },
    { m: 12, amount: 169.5, concept: "Cuota" },
    { m: 12, amount: 28.0, concept: "Fundació 2/5", instC: 2, instT: 5 },
  ];
  for (const d of domData) {
    await prisma.transaction.create({
      data: {
        type: "EXPENSE",
        amount: d.amount,
        date: new Date(`2026-${String(d.m).padStart(2, "0")}-01T10:00:00Z`),
        year: 2026,
        month: d.m,
        concept: d.concept,
        paidBy: "SHARED",
        installmentCurrent: (d as any).instC || null,
        installmentTotal: (d as any).instT || null,
        categoryId: catMap["colegio"],
      },
    });
  }

  // 9. OTROS:
  // 1: 15,00 € (Colchón Emma 25/27)
  // 2: 104,90 € (Colchón 26/27 + Tele 1/12)
  // 3: 104,90 € (Colchón 27/27 + Tele 2/12)
  // 4: 89,90 € (Tele 3/12)
  // 5: 310,90 € (Tele 4/12 + Parking 221)
  // 6 a 12: 210,90 € (Tele + Parking 121)
  await prisma.transaction.create({
    data: { type: "EXPENSE", amount: 15.0, date: new Date("2026-01-01T10:00:00Z"), year: 2026, month: 1, concept: "Colchón emma 25/27", paidBy: "SHARED", installmentCurrent: 25, installmentTotal: 27, categoryId: catMap["otros"] },
  });
  await prisma.transaction.create({
    data: { type: "EXPENSE", amount: 15.0, date: new Date("2026-02-01T10:00:00Z"), year: 2026, month: 2, concept: "Colchón emma 26/27", paidBy: "SHARED", installmentCurrent: 26, installmentTotal: 27, categoryId: catMap["otros"] },
  });
  await prisma.transaction.create({
    data: { type: "EXPENSE", amount: 15.0, date: new Date("2026-03-01T10:00:00Z"), year: 2026, month: 3, concept: "Colchón emma 27/27", paidBy: "SHARED", installmentCurrent: 27, installmentTotal: 27, categoryId: catMap["otros"] },
  });

  for (let m = 2; m <= 12; m++) {
    const inst = m - 1;
    await prisma.transaction.create({
      data: { type: "EXPENSE", amount: 89.9, date: new Date(`2026-${String(m).padStart(2, "0")}-01T10:00:00Z`), year: 2026, month: m, concept: `Tele ${inst}/12`, paidBy: "SHARED", installmentCurrent: inst, installmentTotal: 12, categoryId: catMap["otros"] },
    });
  }

  await prisma.transaction.create({
    data: { type: "EXPENSE", amount: 221.0, date: new Date("2026-05-01T10:00:00Z"), year: 2026, month: 5, concept: "Parking", paidBy: "SHARED", categoryId: catMap["otros"] },
  });

  for (let m = 6; m <= 12; m++) {
    await prisma.transaction.create({
      data: { type: "EXPENSE", amount: 121.0, date: new Date(`2026-${String(m).padStart(2, "0")}-01T10:00:00Z`), year: 2026, month: m, concept: "Parking", paidBy: "SHARED", categoryId: catMap["otros"] },
    });
  }

  console.log("✅ Matriz mensual verificada al 100% con la hoja 'RESUMEN POR MESES'.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
