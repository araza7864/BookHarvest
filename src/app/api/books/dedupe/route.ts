import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const books = await prisma.book.findMany({ orderBy: { createdAt: "asc" } });
    const byKey = new Map<string, { id: string; stock: number }[]>();

    for (const b of books) {
      const key = `${(b.title || "").trim().toLowerCase()}|||${(b.author || "").trim().toLowerCase()}`;
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key)!.push({ id: b.id, stock: b.stock });
    }

    let merged = 0;
    for (const [, group] of Array.from(byKey.entries())) {
      if (group.length < 2) continue;
      const [keep, ...dupes] = group;
      const totalStock = group.reduce((s, x) => s + x.stock, 0);

      await prisma.book.update({
        where: { id: keep.id },
        data: { stock: totalStock },
      });

      for (const d of dupes) {
        await prisma.orderItem.updateMany({ where: { bookId: d.id }, data: { bookId: keep.id } });
        await prisma.book.delete({ where: { id: d.id } });
        merged++;
      }
    }

    return NextResponse.json({ merged, duplicatesRemoved: merged });
  } catch (e) {
    console.error("Dedupe error:", e);
    return NextResponse.json({ error: "Failed to merge duplicates" }, { status: 500 });
  }
}
