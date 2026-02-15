import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url);
  const grade = searchParams.get("grade");
  const genre = searchParams.get("genre");
  const theme = searchParams.get("theme");
  const inStock = searchParams.get("inStock");
  const sort = searchParams.get("sort");

  const where: Record<string, unknown> = {};
  if (grade) {
    const g = parseInt(grade, 10);
    where.gradeMin = { lte: g };
    where.gradeMax = { gte: g };
  }
  if (genre) where.genre = genre;
  if (theme) where.theme = theme;
  if (inStock === "true") where.stock = { gt: 0 };

  const orderBy = sort === "popularity"
    ? [{ popularity: "desc" as const }, { title: "asc" as const }]
    : sort === "price"
    ? [{ costPerUnit: "asc" as const }]
    : [{ gradeMin: "asc" as const }, { title: "asc" as const }];

  const books = await prisma.book.findMany({
    where,
    orderBy,
  });
  return NextResponse.json(books, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
  } catch (e) {
    console.error("Books API error:", e);
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      author,
      isbn,
      gradeMin,
      gradeMax,
      genre,
      theme,
      diversity,
      readingLevel,
      stock,
      bundleSize,
      costPerUnit,
      description,
    } = body;

    if (!title || gradeMin == null || gradeMax == null) {
      return NextResponse.json(
        { error: "Title, gradeMin, gradeMax required" },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title,
        author: author || null,
        isbn: isbn || null,
        gradeMin: parseInt(gradeMin, 10),
        gradeMax: parseInt(gradeMax, 10),
        genre: genre || null,
        theme: theme || null,
        diversity: diversity || null,
        readingLevel: readingLevel || null,
        stock: stock ?? 0,
        bundleSize: bundleSize ?? 40,
        costPerUnit: costPerUnit ?? 0,
        description: description || null,
      },
    });
    return NextResponse.json(book);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}
