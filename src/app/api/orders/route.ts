import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (schoolId) where.schoolId = schoolId;
  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    include: {
      school: true,
      user: true,
      items: { include: { book: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
  } catch (e) {
    console.error("Orders API error:", e);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schoolId, userId, gradeCounts, matches, packingList, source, items: shopItems, customerEmail, customerName } = body;

    // Shop order from customer website
    if (source === "shop" && Array.isArray(shopItems) && shopItems.length > 0) {
      const totalBooks = shopItems.reduce((s: number, i: { quantity: number }) => s + (i.quantity || 0), 0);

      // Validate stock and decrement
      for (const item of shopItems as { bookId: string; quantity: number }[]) {
        const book = await prisma.book.findUnique({ where: { id: item.bookId } });
        if (!book || book.stock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${book?.title ?? "book"}` },
            { status: 400 }
          );
        }
      }

      const order = await prisma.order.create({
        data: {
          source: "shop",
          customerEmail: customerEmail || null,
          customerName: customerName || null,
          status: "submitted",
          totalBooks,
          items: {
            create: (shopItems as { bookId: string; quantity: number }[]).map((m) => ({
              bookId: m.bookId,
              quantity: m.quantity,
            })),
          },
        },
        include: { items: { include: { book: true } } },
      });
      return NextResponse.json(order);
    }

    // School order (legacy)
    if (!schoolId || !userId) {
      return NextResponse.json(
        { error: "schoolId and userId required for school orders" },
        { status: 400 }
      );
    }

    const totalStudents = (gradeCounts as { grade: number; count: number }[]).reduce(
      (s, g) => s + g.count,
      0
    );
    const totalBooks = (matches as { quantity: number }[]).reduce(
      (s, m) => s + m.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        schoolId,
        userId,
        source: "school",
        status: "submitted",
        totalBooks,
        totalStudents,
        packingList: packingList ? JSON.stringify(packingList) : null,
        items: {
          create: (matches as { bookId: string; quantity: number; grade?: number }[]).map(
            (m) => ({
              bookId: m.bookId,
              quantity: m.quantity,
              grade: m.grade ?? null,
            })
          ),
        },
      },
      include: { items: { include: { book: true } }, school: true },
    });
    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
