"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function ShopCartPage() {
  const { cart, removeItem, updateQty } = useCart();

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold text-harvest-800">Your cart is empty</h1>
        <Link href="/shop/books" className="text-harvest-600 hover:text-harvest-700">
          Browse books →
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-harvest-800">Shopping Cart</h1>
      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.bookId}
            className="flex items-center justify-between gap-4 rounded-xl border border-harvest-200 bg-white p-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-harvest-100">
                {item.coverImage ? (
                  <img src={item.coverImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl">📖</div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-harvest-800">{item.title}</h3>
                <p className="text-sm text-harvest-600">{item.author ?? "Unknown"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.bookId, item.quantity - 1)}
                  className="rounded border border-harvest-300 px-2 py-1 hover:bg-harvest-50"
                >
                  −
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.bookId, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="rounded border border-harvest-300 px-2 py-1 hover:bg-harvest-50 disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item.bookId)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-end rounded-xl border border-harvest-200 bg-white p-6">
        <Link
          href="/shop/checkout"
          className="rounded-lg bg-citrus-500 px-6 py-3 font-semibold text-white hover:bg-citrus-600"
        >
          Checkout
        </Link>
      </div>
    </main>
  );
}
