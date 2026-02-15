"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function ShopCheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (cart.length === 0 && !loading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold text-harvest-800">Your cart is empty</h1>
        <Link href="/shop/books" className="text-harvest-600 hover:text-harvest-700">
          Browse books →
        </Link>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "shop",
          customerName: name,
          customerEmail: email,
          items: cart.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      clearCart();
      router.push("/shop/thank-you");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-harvest-800">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
        )}
        <div>
          <label className="mb-1 block font-medium text-harvest-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-harvest-200 px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-medium text-harvest-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-harvest-200 px-4 py-2"
            required
          />
        </div>
        <div className="rounded-xl border border-harvest-200 bg-harvest-50 p-4">
          <p className="font-semibold text-harvest-800">
            {cart.reduce((s, i) => s + i.quantity, 0)} book(s) in your order
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-citrus-500 py-3 font-semibold text-white hover:bg-citrus-600 disabled:opacity-50"
        >
          {loading ? "Processing…" : "Place Order"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-harvest-500">
        This is a demo. No payment is collected.
      </p>
    </main>
  );
}
