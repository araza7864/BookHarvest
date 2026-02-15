"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const path = usePathname();
  const { user, logout } = useAuth();
  if (path?.startsWith("/shop")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-harvest-200/60 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-harvest-700">📚</span>
          <span className="text-xl font-bold text-harvest-800">Book Harvest</span>
        </Link>
        <nav className="flex items-center gap-6">
          <a
            href={process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000"}
            className="text-harvest-800/80 hover:text-harvest-600"
          >
            Homepage
          </a>
          <Link
            href="/"
            className="text-harvest-800/80 hover:text-harvest-600"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/books"
            className="text-harvest-800/80 hover:text-harvest-600"
          >
            Catalog
          </Link>
          <Link
            href="/admin/analytics"
            className="text-harvest-800/80 hover:text-harvest-600"
          >
            Analytics
          </Link>
          <Link
            href="/admin/map"
            className="text-harvest-800/80 hover:text-harvest-600"
          >
            Impact Map
          </Link>
          <Link
            href="/shop"
            className="text-harvest-800/80 hover:text-harvest-600"
          >
            Book Shop
          </Link>
          {user && (
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-citrus-500 px-4 py-2 font-medium text-white hover:bg-citrus-600"
            >
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
