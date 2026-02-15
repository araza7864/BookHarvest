"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const HOME_URL = process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "admin") {
      window.location.href = `${HOME_URL}/login`;
    }
  }, [user, ready]);

  if (!ready || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-harvest-600">Redirecting to login…</p>
      </div>
    );
  }

  return <>{children}</>;
}
