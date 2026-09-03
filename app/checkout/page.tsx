"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

type UserData = {
  name: string | null;
  email: string | null;
  customerType: "NORMAL" | "FOUNDER";
  founderDiscount: string | null;
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();

  const [user, setUser] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load current user
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/checkout/user");

        if (!response.ok) {
          window.location.href = "/login?callbackUrl=/checkout";
          return;
        }

        const data = await response.json();

        setUser(data.user);
        setName(data.user.name ?? "");
        setEmail(data.user.email ?? "");
      } catch {
        setError("Unable to load your account information.");
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, []);

  // Empty cart
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold">Checkout</h1>

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

  // Loading user
  if (loadingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading checkout...</p>
      </main>
    );
  }

  // Founder discount
  const discountPercentage: number =
    user?.customerType === "FOUNDER" ? Number(user.founderDiscount ?? 0) : 0;

  const discount: number = subtotal * (discountPercentage / 100);

  // Shipping
  const shippingCost: number = 0;

  // Final total
  const total = subtotal - discount + shippingCost;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!address.trim()) {
      setError("Please enter your shipping address.");
      return;
    }

    if (!city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            variantId: item.variantId,
            quantity: item.quantity,
          })),

          customerName: name,
          customerEmail: email,

          shippingAddress: address,
          shippingCity: city,
          shippingPostalCode: postalCode,

          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Failed to create your order.");
        return;
      }

      // Order was successfully created.
      // Clear the cart before redirecting to the order page.
      clearCart();

      window.location.href = `/orders/${data.orderId}`;
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);

      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Checkout</h1>

          <p className="mt-2 text-gray-500">
            Complete your information to place your order.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2">
            {/* Customer Information */}
            <section className="rounded-xl border p-6">
              <h2 className="text-xl font-semibold">Customer Information</h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium">Name</label>

                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium">Email</label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </section>

            {/* Shipping */}
            <section className="mt-6 rounded-xl border p-6">
              <h2 className="text-xl font-semibold">Shipping Information</h2>

              <div className="mt-6 space-y-5">
                {/* Address */}
                <div>
                  <label className="text-sm font-medium">Address</label>

                  <textarea
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-lg border px-4 py-3 outline-none focus:border-black"
                    placeholder="Street address"
                  />
                </div>

                {/* City + Postal Code */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">City</label>

                    <input
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Postal Code</label>

                    <input
                      value={postalCode}
                      onChange={(event) => setPostalCode(event.target.value)}
                      className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                      placeholder="Postal code"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="mt-6 rounded-xl border p-6">
              <h2 className="text-xl font-semibold">Payment Method</h2>

              <div className="mt-6">
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-5 transition ${
                    paymentMethod === "COD"
                      ? "border-black bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                      className="h-4 w-4"
                    />

                    <div>
                      <p className="font-medium">Cash on Delivery</p>

                      <p className="mt-1 text-sm text-gray-500">
                        Pay when your order arrives.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-black px-6 py-4 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          {/* Order Summary */}
          <aside className="h-fit rounded-xl border p-6">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            {/* Items */}
            <div className="mt-6 space-y-5">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.name}</p>

                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-3 border-t pt-6">
              {/* Subtotal */}
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>

                <span>${subtotal.toFixed(2)}</span>
              </div>

              {/* Founder Discount */}
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Founder Discount ({discountPercentage}%)</span>

                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              {/* Shipping */}
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>

                <span>
                  {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>

              {/* Total */}
              <div className="flex justify-between border-t pt-4 text-lg font-semibold">
                <span>Total</span>

                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
