"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const TOKEN_KEY = "bh_token";
const ROLE_KEY = "bh_role";
const HOME_URL = process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000";

function decodeJwtPayload(token: string): { sub?: string; role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

function getUrlToken(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}

type AuthContextType = {
  user: { role: string } | null;
  token: string | null;
  ready: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("logout") === "1") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
      window.history.replaceState({}, "", window.location.pathname);
      window.location.href = `${HOME_URL}?logout=1`;
      return;
    }

    const urlToken = getUrlToken();
    if (urlToken) {
      const payload = decodeJwtPayload(urlToken);
      if (payload?.role) {
        localStorage.setItem(TOKEN_KEY, urlToken);
        localStorage.setItem(ROLE_KEY, payload.role);
        setToken(urlToken);
        setUser({ role: payload.role });
        window.history.replaceState({}, "", window.location.pathname);
      }
    } else {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedRole = localStorage.getItem(ROLE_KEY);
      if (storedToken && storedRole) {
        setToken(storedToken);
        setUser({ role: storedRole });
      }
    }
    setReady(true);
  }, []);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    setToken(null);
    setUser(null);
    window.location.href = `${HOME_URL}?logout=1`;
  };

  return (
    <AuthContext.Provider value={{ user, token, ready, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
