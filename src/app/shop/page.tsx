"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface Book {
  id: string;
  title: string;
  author: string | null;
  genre: string | null;
  theme: string | null;
  stock: number;
  popularity: number;
  coverImage?: string | null;
}

export default function ShopHomePage() {
  const [popular, setPopular] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/books?inStock=true&sort=popularity")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        setPopular(Array.isArray(d) ? d.slice(0, 8) : []);
      })
      .catch(() => {
        setPopular([]);
        setError("Could not load books. Try refreshing.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <section className="mb-12 rounded-2xl bg-gradient-to-br from-harvest-600 to-harvest-800 px-8 py-16 text-white">
        <h1 className="text-4xl font-bold">Books for Every Reader</h1>
        <p className="mt-4 text-xl text-harvest-100">
          Discover children&apos;s books, fiction, nonfiction &mdash; all ages welcome.
        </p>
        <Link
          href="/shop/books"
          className="mt-6 inline-block rounded-lg bg-citrus-500 px-6 py-3 font-semibold text-white hover:bg-citrus-600"
        >
          Browse All Books
        </Link>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold text-harvest-800">Most Popular Right Now</h2>
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
        )}
        {loading ? (
          <p className="text-harvest-600">Loading books…</p>
        ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {popular.map((b) => (
            <div
              key={b.id}
              className="flex flex-col rounded-xl border border-harvest-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="relative mb-3 h-40 overflow-hidden rounded-lg bg-harvest-100">
                {b.coverImage ? (
                  <img
                    src={b.coverImage}
                    alt={b.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      if (el) el.style.display = "none";
                      const fallback = el?.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div className={`flex h-full items-center justify-center text-4xl ${b.coverImage ? "hidden" : ""}`}>
                  📖
                </div>
              </div>
              <h3 className="font-semibold text-harvest-800 line-clamp-2">{b.title}</h3>
              <p className="mt-1 text-sm text-harvest-600">{b.author ?? "Unknown"}</p>
              <div className="mt-auto flex gap-2 pt-4">
                <Link
                  href={`/shop/books?id=${b.id}`}
                  className="flex-1 rounded-lg border border-harvest-300 px-3 py-2 text-center text-sm font-medium text-harvest-700 hover:bg-harvest-50"
                >
                  View
                </Link>
                <button
                  onClick={() => addItem({ bookId: b.id, title: b.title, author: b.author, price: 0, stock: b.stock, coverImage: b.coverImage })}
                  disabled={b.stock < 1}
                  className="flex-1 rounded-lg bg-harvest-600 px-3 py-2 text-sm font-medium text-white hover:bg-harvest-700 disabled:opacity-50"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>
    </main>
  );
}
