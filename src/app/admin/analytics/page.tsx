"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface OrderItem {
  bookId: string;
  quantity: number;
  book?: { title: string; author?: string | null };
}

interface Order {
  totalBooks: number;
  status: string;
  source?: string;
  createdAt: string;
  items?: OrderItem[];
}

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [schools, setSchools] = useState<{ region?: string }[]>([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]));
    fetch("/api/schools")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setSchools(Array.isArray(d) ? d : []))
      .catch(() => setSchools([]));
  }, []);

  const totalBooks = orders.reduce((s, o) => s + (o.totalBooks ?? 0), 0);
  const totalOrders = orders.length;

  const bySource = orders.reduce((acc, o) => {
    const src = o.source ?? "school";
    acc[src] = (acc[src] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topBooksMap = new Map<string, { title: string; author: string; qty: number }>();
  for (const o of orders) {
    for (const item of o.items ?? []) {
      const title = item.book?.title ?? "Unknown";
      const author = item.book?.author ?? "";
      const key = `${item.bookId}`;
      const existing = topBooksMap.get(key);
      if (existing) {
        existing.qty += item.quantity ?? 0;
      } else {
        topBooksMap.set(key, { title, author, qty: item.quantity ?? 0 });
      }
    }
  }
  const topBooks = Array.from(topBooksMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  const byMonth = orders.reduce((acc, o) => {
    const m = new Date(o.createdAt).toLocaleString("default", {
      month: "short",
      year: "2-digit",
    });
    acc[m] = (acc[m] ?? 0) + (o.totalBooks ?? 0);
    return acc;
  }, {} as Record<string, number>);
  const chartData = Object.entries(byMonth).map(([name, books]) => ({
    name,
    books,
  }));

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(statusCounts).map(([name, value], i) => ({
    name,
    value,
    fill: ["#286f55", "#f97316", "#368a6a", "#86c4a6"][i % 4],
  }));

  const sourcePieData = Object.entries(bySource).map(([name, value], i) => ({
    name: name === "shop" ? "Shop" : "School",
    value,
    fill: ["#286f55", "#f97316"][i % 2],
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-harvest-800">
        Impact analytics
      </h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-harvest-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-harvest-600">Total books distributed</p>
          <p className="text-3xl font-bold text-harvest-700">{totalBooks.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-harvest-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-harvest-600">Total orders</p>
          <p className="text-3xl font-bold text-harvest-700">{totalOrders.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-harvest-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-harvest-600">Schools served</p>
          <p className="text-3xl font-bold text-harvest-700">{schools.length}</p>
        </div>
        <div className="rounded-xl border border-harvest-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-harvest-600">Shop orders</p>
          <p className="text-3xl font-bold text-harvest-700">
            {(bySource["shop"] ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-harvest-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-harvest-800">Top selling books</h3>
          {topBooks.length === 0 ? (
            <p className="text-sm text-harvest-500">No orders yet. Top books will appear here.</p>
          ) : (
            <ol className="space-y-2">
              {topBooks.map((b, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-harvest-100 bg-harvest-50/30 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <span className="mr-2 font-medium text-harvest-700">#{i + 1}</span>
                    <span className="font-medium text-harvest-800">{b.title}</span>
                    {b.author && (
                      <span className="ml-1 text-sm text-harvest-600">by {b.author}</span>
                    )}
                  </div>
                  <span className="ml-2 shrink-0 rounded bg-citrus-100 px-2 py-0.5 text-sm font-semibold text-citrus-700">
                    {b.qty} sold
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-xl border border-harvest-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-harvest-800">Orders by source</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourcePieData.length ? sourcePieData : [{ name: "—", value: 1, fill: "#ccc" }]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {sourcePieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-harvest-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-harvest-800">Books distributed over time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.length ? chartData : [{ name: "—", books: 0 }]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="books" fill="#286f55" name="Books" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-harvest-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-harvest-800">Orders by status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData.length ? pieData : [{ name: "—", value: 1, fill: "#ccc" }]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}
