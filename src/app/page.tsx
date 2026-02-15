"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function OrderRow({
  order: o,
  onMarkDone,
}: {
  order: { id: string; source: string; status: string; totalBooks: number; customerName?: string; createdAt: string };
  onMarkDone: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const isDone = o.status === "shipped";

  async function handleMarkDone() {
    setLoading(true);
    try {
      await fetch(`/api/orders/${o.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });
      onMarkDone();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-3 ${
        isDone ? "border-harvest-200 bg-harvest-100/50 opacity-75" : "border-harvest-100 bg-harvest-50/50"
      }`}
    >
      <div>
        <span className="rounded bg-citrus-100 px-2 py-0.5 text-xs font-medium text-citrus-700">
          {o.source}
        </span>
        <p className="mt-1 font-medium text-harvest-800">
          {o.source === "shop"
            ? `${o.customerName || "Guest"} • ${o.totalBooks} book(s)`
            : `${o.totalBooks} books`}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-sm text-harvest-500">
          {new Date(o.createdAt).toLocaleTimeString()}
        </p>
        <button
          onClick={handleMarkDone}
          disabled={loading || isDone}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
            isDone
              ? "bg-green-500 text-white"
              : "bg-harvest-200 text-harvest-600 hover:bg-harvest-300 hover:text-harvest-800"
          }`}
          title={isDone ? "Done" : "Mark as done"}
        >
          {isDone ? "✓" : loading ? "…" : "○"}
        </button>
      </div>
    </div>
  );
}

interface Order {
  id: string;
  source: string;
  status: string;
  totalBooks: number;
  customerName?: string;
  customerEmail?: string;
  createdAt: string;
}

export default function HomePage() {
  const [stats, setStats] = useState<{
    orders: number;
    books: number;
    students: number;
    pendingApprovals: number;
  } | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  function refresh() {
    Promise.all([
      fetch("/api/orders").then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch("/api/books").then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch("/api/users").then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([orders = [], books = [], users = []]) => {
      const ordersList = Array.isArray(orders) ? orders : [];
      const usersList = Array.isArray(users) ? users : [];
      setStats({
        orders: ordersList.length,
        books: Array.isArray(books) ? books.length : 0,
        students: ordersList.reduce((s: number, o: { totalStudents?: number }) => s + (o.totalStudents ?? 0), 0),
        pendingApprovals: usersList.filter((u: { approved?: boolean }) => !u.approved).length,
      });
      setRecentOrders(ordersList.slice(0, 10));
    }).catch(() => setStats({ orders: 0, books: 0, students: 0, pendingApprovals: 0 }));
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-harvest-800">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-harvest-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-harvest-600">Total orders</p>
          <p className="text-2xl font-bold text-harvest-800">
            {stats?.orders ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-harvest-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-harvest-600">Books in catalog</p>
          <p className="text-2xl font-bold text-harvest-800">
            {stats?.books ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-harvest-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-harvest-600">Students served</p>
          <p className="text-2xl font-bold text-harvest-800">
            {stats?.students ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-harvest-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-harvest-600">Pending approvals</p>
          <p className="text-2xl font-bold text-citrus-600">
            {stats?.pendingApprovals ?? "—"}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-harvest-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-harvest-800">
          Live order feed
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs font-normal text-harvest-500">(updates every 2 sec)</span>
        </h2>
        {recentOrders.length === 0 ? (
          <p className="text-harvest-500">No orders yet. Checkouts from the Book Shop will appear here in real time.</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentOrders.map((o) => (
              <OrderRow
                key={o.id}
                order={o}
                onMarkDone={() => refresh()}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/books"
          className="flex flex-col rounded-xl border border-harvest-200 bg-white p-6 shadow-sm transition hover:border-harvest-400 hover:shadow-md"
        >
          <span className="text-3xl">📚</span>
          <h2 className="mt-4 font-semibold text-harvest-800">Manage catalog</h2>
          <p className="mt-2 text-sm text-harvest-600">
            Add and edit books, track inventory
          </p>
        </Link>
        <Link
          href="/admin/analytics"
          className="flex flex-col rounded-xl border border-harvest-200 bg-white p-6 shadow-sm transition hover:border-harvest-400 hover:shadow-md"
        >
          <span className="text-3xl">📊</span>
          <h2 className="mt-4 font-semibold text-harvest-800">Impact analytics</h2>
          <p className="mt-2 text-sm text-harvest-600">
            Books distributed, cost per student, growth
          </p>
        </Link>
        <Link
          href="/admin/map"
          className="flex flex-col rounded-xl border border-harvest-200 bg-white p-6 shadow-sm transition hover:border-harvest-400 hover:shadow-md"
        >
          <span className="text-3xl">🗺️</span>
          <h2 className="mt-4 font-semibold text-harvest-800">Geographic impact map</h2>
          <p className="mt-2 text-sm text-harvest-600">Schools by region</p>
        </Link>
      </div>
    </main>
  );
}
