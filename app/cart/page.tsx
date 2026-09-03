"use client";

import Link from "next/link";

import { useCart } from "@/app/context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold">Your Cart</h1>

          <div className="mt-12 rounded-xl border p-12 text-center">
            <p className="text-gray-500">Your cart is empty.</p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-lg bg-black px-6 py-3 font-medium text-white"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Your Cart</h1>

          <p className="mt-2 text-gray-500">
            Review your items before checkout.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-5 border-b p-6 last:border-0"
                >
                  {/* Image */}
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-semibold hover:underline"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.variantName}
                      </p>

                      <p className="mt-1 text-gray-500">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center rounded-lg border">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="px-3 py-2 disabled:opacity-30"
                        >
                          −
                        </button>

                        <span className="min-w-10 text-center">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          className="px-3 py-2 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="hidden text-right sm:block">
                    <p className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/products"
              className="mt-6 inline-block text-sm font-medium underline"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="h-fit rounded-xl border p-6">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-gray-500">
                <span>Items</span>

                <span>
                  {items.reduce((total, item) => total + item.quantity, 0)}
                </span>
              </div>

              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>

                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>

                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-xl bg-black px-6 py-4 text-center font-medium text-white transition hover:bg-gray-800"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
