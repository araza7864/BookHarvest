"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  bookId: string;
  title: string;
  author: string | null;
  price: number;
  quantity: number;
  stock: number;
  coverImage?: string | null;
}

const CartContext = createContext<{
  cart: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (bookId: string) => void;
  updateQty: (bookId: string, qty: number) => void;
  clearCart: () => void;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const s = localStorage.getItem("cart");
      if (s) setCart(JSON.parse(s));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.bookId === item.bookId);
      const qty = item.quantity ?? 1;
      if (idx >= 0) {
        const next = [...prev];
        next[idx].quantity = Math.min(next[idx].quantity + qty, next[idx].stock);
        return next;
      }
      return [...prev, { ...item, quantity: Math.min(qty, item.stock) }];
    });
  };

  const removeItem = (bookId: string) => {
    setCart((prev) => prev.filter((i) => i.bookId !== bookId));
  };

  const updateQty = (bookId: string, qty: number) => {
    setCart((prev) => {
      const next = prev.map((i) =>
        i.bookId === bookId ? { ...i, quantity: Math.max(0, Math.min(qty, i.stock)) } : i
      );
      return next.filter((i) => i.quantity > 0);
    });
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
