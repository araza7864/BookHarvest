import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (status === "shipped" || status === "done") {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      // Decrement stock when marking done (for both shop and school orders)
      if (order.status !== "shipped") {
        for (const item of order.items) {
          const book = await prisma.book.findUnique({ where: { id: item.bookId } });
          if (book) {
            const newStock = Math.max(0, book.stock - item.quantity);
            await prisma.book.update({
              where: { id: item.bookId },
              data: { stock: newStock },
            });
          }
        }
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: status === "done" ? "shipped" : status },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
