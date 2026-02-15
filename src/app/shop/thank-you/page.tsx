import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="mb-4 text-3xl font-bold text-harvest-800">Thank you for your order!</h1>
      <p className="mb-8 text-harvest-600">Your books will be on their way soon.</p>
      <Link
        href="/shop"
        className="inline-block rounded-lg bg-harvest-600 px-6 py-3 font-semibold text-white hover:bg-harvest-700"
      >
        Continue Shopping
      </Link>
    </main>
  );
}
