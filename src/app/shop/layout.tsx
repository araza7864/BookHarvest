"use client";

import Link from "next/link";
import { CartProvider, useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

function ShopHeader() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-harvest-200/60 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/shop" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-harvest-700">📚</span>
          <span className="text-xl font-bold text-harvest-800">Book Harvest Store</span>
        </Link>
        <nav className="flex items-center gap-4">
          <a
            href={process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000"}
            className="py-2 text-harvest-800/80 hover:text-harvest-600 shrink-0"
          >
            Home
          </a>
          <Link
            href="/shop"
            className="py-2 text-harvest-800/80 hover:text-harvest-600 shrink-0"
          >
            Store
          </Link>
          <Link
            href="/shop/books"
            className="py-2 text-harvest-800/80 hover:text-harvest-600 shrink-0"
          >
            All Books
          </Link>
          <Link
            href="/shop/cart"
            className="flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2 font-medium text-white hover:bg-sky-500 transition shrink-0"
          >
            🛒 Cart {count > 0 && <span className="rounded-full bg-white/30 px-2 py-0.5 text-sm">{count}</span>}
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="py-2 text-harvest-800/80 hover:text-harvest-600 shrink-0">
              Admin →
            </Link>
          )}
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-citrus-500 px-4 py-2 font-medium text-white hover:bg-citrus-600 transition shrink-0"
            >
              Log out
            </button>
          ) : (
            <a
              href={`${process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000"}/login?redirect=shop`}
              className="rounded-lg bg-citrus-500 px-4 py-2 font-medium text-white hover:bg-citrus-600 transition shrink-0"
            >
              Log in
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <ShopHeader />
      {children}
    </CartProvider>
  );
}
