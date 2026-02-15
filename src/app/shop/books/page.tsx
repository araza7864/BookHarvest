"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface Book {
  id: string;
  title: string;
  author: string | null;
  genre: string | null;
  theme: string | null;
  gradeMin: number;
  gradeMax: number;
  stock: number;
  coverImage?: string | null;
}

const GENRES = ["children", "fiction", "nonfiction"];
const THEMES = ["adventure", "STEM", "culture", "humor", "nature", "friendship", "empathy", "bedtime", "fun"];

function ShopBooksContent() {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [genre, setGenre] = useState(searchParams.get("genre") || "");
  const [theme, setTheme] = useState(searchParams.get("theme") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "popularity");
  const { addItem } = useCart();

  useEffect(() => {
    const params = new URLSearchParams();
    if (genre) params.set("genre", genre);
    if (theme) params.set("theme", theme);
    params.set("inStock", "true");
    params.set("sort", sort);
    fetch(`/api/books?${params}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setBooks(Array.isArray(d) ? d : []));
  }, [genre, theme, sort]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-harvest-800">All Books</h1>

      <div className="mb-8 flex flex-wrap gap-4 rounded-xl border border-harvest-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-harvest-600">Genre</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="rounded-lg border border-harvest-200 px-3 py-2"
          >
            <option value="">All</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-harvest-600">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="rounded-lg border border-harvest-200 px-3 py-2"
          >
            <option value="">All</option>
            {THEMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-harvest-600">Sort by</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-harvest-200 px-3 py-2"
          >
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {books.map((b) => (
          <div
            key={b.id}
            className="flex flex-col rounded-xl border border-harvest-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="relative mb-3 h-36 overflow-hidden rounded-lg bg-harvest-100">
              {b.coverImage ? (
                <img
                  src={b.coverImage}
                  alt={b.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div className={`flex h-full items-center justify-center text-3xl ${b.coverImage ? "hidden" : ""}`}>
                📖
              </div>
            </div>
            <h3 className="font-semibold text-harvest-800 line-clamp-2">{b.title}</h3>
            <p className="mt-1 text-sm text-harvest-600">{b.author ?? "Unknown"}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {b.genre && <span className="rounded bg-harvest-100 px-2 py-0.5 text-xs text-harvest-700">{b.genre}</span>}
              {b.theme && <span className="rounded bg-citrus-100 px-2 py-0.5 text-xs text-citrus-700">{b.theme}</span>}
            </div>
            <p className="text-sm text-harvest-500">Grades {b.gradeMin}-{b.gradeMax}</p>
            <button
              onClick={() => addItem({ bookId: b.id, title: b.title, author: b.author, price: 0, stock: b.stock, coverImage: b.coverImage })}
              disabled={b.stock < 1}
              className="mt-4 w-full rounded-lg bg-harvest-600 py-2 text-sm font-medium text-white hover:bg-harvest-700 disabled:opacity-50"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function ShopBooksPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-6xl px-6 py-12">Loading…</main>}>
      <ShopBooksContent />
    </Suspense>
  );
}
