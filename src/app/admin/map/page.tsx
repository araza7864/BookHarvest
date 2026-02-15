"use client";

import { useEffect, useState } from "react";

interface School {
  id: string;
  name: string;
  city?: string;
  state?: string;
  region?: string;
  orderCount: number;
}

interface Order {
  schoolId: string;
  totalBooks: number;
  totalStudents: number;
}

export default function AdminMapPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/schools").then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch("/api/orders").then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([schoolsData, ordersData]) => {
      setSchools(Array.isArray(schoolsData) ? schoolsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    });
  }, []);

  const byRegion = schools.reduce((acc, s) => {
    const region = s.state || s.region || "Unknown";
    if (!acc[region]) acc[region] = { schools: [], books: 0, students: 0 };
    acc[region].schools.push(s);
    const schoolOrders = orders.filter((o) => o.schoolId === s.id);
    acc[region].books += schoolOrders.reduce((b, o) => b + (o.totalBooks ?? 0), 0);
    acc[region].students += schoolOrders.reduce((b, o) => b + (o.totalStudents ?? 0), 0);
    return acc;
  }, {} as Record<string, { schools: School[]; books: number; students: number }>);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-harvest-800">
        Geographic impact map
      </h1>
      <p className="mb-8 text-harvest-600">
        Schools served by region • Books distributed per area
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(byRegion).map(([region, data]) => (
          <div
            key={region}
            className="rounded-xl border border-harvest-200 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-harvest-800">
              <span className="inline-block h-3 w-3 rounded-full bg-harvest-500" />
              {region}
            </h3>
            <p className="mb-4 text-sm text-harvest-600">
              {data.books.toLocaleString()} books • {data.students.toLocaleString()} students
              • {data.schools.length} schools
            </p>
            <ul className="space-y-2">
              {data.schools.map((s) => (
                <li key={s.id} className="flex justify-between text-sm">
                  <span className="text-harvest-800">{s.name}</span>
                  <span className="text-harvest-600">
                    {orders
                      .filter((o) => o.schoolId === s.id)
                      .reduce((b, o) => b + (o.totalBooks ?? 0), 0)}{" "}
                    books
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {schools.length === 0 && (
        <div className="rounded-xl border border-harvest-200 bg-harvest-50 p-12 text-center text-harvest-600">
          No schools with orders yet. Geographic data will appear as schools register
          and place orders.
        </div>
      )}
    </main>
  );
}
