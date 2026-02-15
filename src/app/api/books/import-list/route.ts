import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const GENRES = ["children", "fiction", "nonfiction"];
const THEMES = ["STEM", "adventure", "humor", "friendship", "nature", "culture", "empathy", "history", "family", "school", "animals", "fun", "bedtime", "community", "creativity"];

interface BookInput {
  title: string;
  author: string;
  description: string;
  quantity?: number;
}

function parseLine(line: string, delim: string): [string, string, string, number | undefined] | null {
  const parts = line.split(delim).map((p) => p.trim());
  if (parts.length >= 3 && parts[0]) {
    let desc: string;
    let quantity: number | undefined;
    if (parts.length >= 4) {
      const last = parts[parts.length - 1];
      const qty = parseInt(last, 10);
      if (String(qty) === last && qty >= 0) {
        quantity = qty;
        desc = parts.slice(2, -1).join(delim).trim();
      } else {
        desc = parts.slice(2).join(delim).trim();
      }
    } else {
      desc = parts[2] || "";
    }
    return [parts[0], parts[1] || "", desc || "", quantity];
  }
  return null;
}

function parseBooksFromText(text: string): BookInput[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const books: BookInput[] = [];

  const delim = lines[0]?.includes("\t") ? "\t" : lines[0]?.includes("|") ? "|" : ",";
  const first = parseLine(lines[0] ?? "", delim);
  const isHeader = first && /^(title|Title|author|Author|description|Description|quantity|Quantity)$/i.test(first[0]);
  const start = isHeader ? 1 : 0;

  for (let i = start; i < lines.length; i++) {
    const parsed = parseLine(lines[i] ?? "", delim);
    if (parsed)
      books.push({
        title: parsed[0],
        author: parsed[1],
        description: parsed[2],
        quantity: parsed[3],
      });
  }
  return books;
}

function parseBooksFromJson(raw: string): BookInput[] {
  const arr = JSON.parse(raw);
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((b: unknown) => b && typeof b === "object" && "title" in b)
    .map((b: { title?: string; author?: string; description?: string; quantity?: number }) => ({
      title: String(b.title ?? "").trim(),
      author: String(b.author ?? "").trim(),
      description: String(b.description ?? "").trim(),
      quantity: typeof b.quantity === "number" ? b.quantity : undefined,
    }))
    .filter((b) => b.title);
}

export async function POST(req: NextRequest) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured. Add it to .env for AI categorization." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { books: rawBooks } = body;

    let books: BookInput[];
    if (Array.isArray(rawBooks)) {
      books = rawBooks
        .filter((b: unknown) => b && typeof b === "object")
        .map((b: { title?: string; author?: string; description?: string; quantity?: number }) => ({
          title: String(b.title ?? "").trim(),
          author: String(b.author ?? "").trim(),
          description: String(b.description ?? "").trim(),
          quantity: typeof b.quantity === "number" ? b.quantity : undefined,
        }))
        .filter((b) => b.title);
    } else if (typeof rawBooks === "string") {
      const trimmed = rawBooks.trim();
      if (trimmed.startsWith("[")) {
        books = parseBooksFromJson(trimmed);
      } else {
        books = parseBooksFromText(trimmed);
      }
    } else {
      return NextResponse.json({ error: "books array or text required" }, { status: 400 });
    }

    if (books.length === 0) {
      return NextResponse.json({ error: "No valid books to import", added: 0, failed: [] }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: key });
    const prompt = books
      .map(
        (b, i) =>
          `${i + 1}. Title: ${b.title} | Author: ${b.author} | Description: ${b.description.slice(0, 300)}`
      )
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: Math.min(4096, books.length * 80 + 200),
      messages: [
        {
          role: "system",
          content: `For each book below, output genre (one of: ${GENRES.join(", ")}), theme (one of: ${THEMES.join(", ")}), gradeMin (1-12), gradeMax (1-12). Use title and description keywords. Respond with ONLY a JSON array, same order as input: [{"genre":"","theme":"","gradeMin":1,"gradeMax":3}, ...]`,
        },
        { role: "user", content: prompt },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim() || "[]";
    let categorizations: { genre: string; theme: string; gradeMin: number; gradeMax: number }[];
    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      categorizations = JSON.parse(cleaned);
      if (!Array.isArray(categorizations)) categorizations = [];
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON", added: 0, failed: books.map((b) => b.title) },
        { status: 500 }
      );
    }

    const added: string[] = [];
    const updated: { id: string; title: string; addedStock: number }[] = [];
    const failed: { title: string; error: string }[] = [];
    const allBooks = await prisma.book.findMany({ select: { id: true, title: true, author: true, stock: true } });

    const findExisting = (title: string, author: string) =>
      allBooks.find(
        (x) =>
          x.title.trim().toLowerCase() === title.trim().toLowerCase() &&
          (x.author || "").trim().toLowerCase() === (author || "").trim().toLowerCase()
      );

    for (let i = 0; i < books.length; i++) {
      const b = books[i];
      const addQty = typeof b.quantity === "number" && b.quantity >= 0 ? b.quantity : 100;
      const existing = findExisting(b.title, b.author);

      if (existing) {
        try {
          const newStock = existing.stock + addQty;
          await prisma.book.update({
            where: { id: existing.id },
            data: { stock: newStock },
          });
          updated.push({ id: existing.id, title: b.title, addedStock: addQty });
          const idx = allBooks.findIndex((x) => x.id === existing.id);
          if (idx >= 0) allBooks[idx] = { ...allBooks[idx], stock: newStock };
        } catch (e) {
          failed.push({ title: b.title, error: e instanceof Error ? e.message : "Failed to update" });
        }
      } else {
        const cat = categorizations[i] || { genre: "fiction", theme: "", gradeMin: 4, gradeMax: 6 };
        const genre = GENRES.includes(cat.genre) ? cat.genre : "fiction";
        const gradeMin = Math.min(12, Math.max(1, Number(cat.gradeMin) || 4));
        const gradeMax = Math.min(12, Math.max(1, Number(cat.gradeMax) || 6));
        try {
          const book = await prisma.book.create({
            data: {
              title: b.title,
              author: b.author || null,
              description: b.description || null,
              genre,
              theme: cat.theme && THEMES.includes(cat.theme) ? cat.theme : null,
              gradeMin,
              gradeMax,
              stock: addQty,
              bundleSize: 40,
            },
          });
          added.push(b.title);
          allBooks.push({ id: book.id, title: book.title, author: book.author, stock: book.stock });
        } catch (e) {
          failed.push({
            title: b.title,
            error: e instanceof Error ? e.message : "Failed to create",
          });
        }
      }
    }

    return NextResponse.json({
      added: added.length,
      updated: updated.length,
      failed,
      titles: added,
      toppedUp: updated,
    });
  } catch (e) {
    console.error("Import list error:", e);
    const msg = e instanceof Error ? e.message : "Import failed";
    return NextResponse.json({ error: msg, added: 0, failed: [] }, { status: 500 });
  }
}
