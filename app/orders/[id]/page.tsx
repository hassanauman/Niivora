import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

type OrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  // ─────────────────────────────────────────
  // 1. Check authentication
  // ─────────────────────────────────────────

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // ─────────────────────────────────────────
  // 2. Get order ID
  // ─────────────────────────────────────────

  const { id } = await params;

  // ─────────────────────────────────────────
  // 3. Fetch order
  // ─────────────────────────────────────────

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
    },
  });

  // ─────────────────────────────────────────
  // 4. Order doesn't exist
  // ─────────────────────────────────────────

  if (!order) {
    notFound();
  }

  // ─────────────────────────────────────────
  // 5. Security check
  // ─────────────────────────────────────────

  if (order.userId !== session.user.id) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-5xl">
        {/* ─────────────────────────────────── */}
        {/* Success Header */}
        {/* ─────────────────────────────────── */}

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">
            ✓
          </div>

          <h1 className="mt-6 text-4xl font-bold">Order Confirmed</h1>

          <p className="mt-3 text-gray-500">Thank you for your order!</p>

          <p className="mt-2 text-sm text-gray-400">Order #{order.id}</p>
        </div>

        {/* ─────────────────────────────────── */}
        {/* Order Information */}
        {/* ─────────────────────────────────── */}

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Order Items */}
          <section className="rounded-xl border p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold">Order Items</h2>

            <div className="mt-6 divide-y">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-5"
                >
                  <div>
                    <p className="font-medium">{item.productName}</p>

                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      ${item.price.toString()} each
                    </p>
                  </div>

                  <p className="font-medium">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-3 border-t pt-6">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>

                <span>${order.subtotal.toString()}</span>
              </div>

              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>

                  <span>-${order.discount.toString()}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>

                <span>
                  {Number(order.shippingCost) === 0
                    ? "Free"
                    : `$${order.shippingCost.toString()}`}
                </span>
              </div>

              <div className="flex justify-between border-t pt-4 text-lg font-semibold">
                <span>Total</span>

                <span>${order.total.toString()}</span>
              </div>
            </div>
          </section>

          {/* Order Status */}
          <aside className="h-fit rounded-xl border p-6">
            <h2 className="text-xl font-semibold">Order Status</h2>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm text-gray-500">Order Status</p>

                <p className="mt-1 font-medium">{order.status}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Payment Status</p>

                <p className="mt-1 font-medium">{order.paymentStatus}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Order Date</p>

                <p className="mt-1 font-medium">
                  {order.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* ─────────────────────────────────── */}
        {/* Customer + Shipping */}
        {/* ─────────────────────────────────── */}

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <section className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold">Customer Information</h2>

            <div className="mt-5 space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>

                <p className="font-medium">{order.customerName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>

                <p className="font-medium">{order.customerEmail}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold">Shipping Address</h2>

            <div className="mt-5">
              <p className="font-medium">{order.shippingAddress}</p>

              <p className="mt-1 text-gray-500">
                {order.shippingCity}
                {order.shippingPostalCode
                  ? `, ${order.shippingPostalCode}`
                  : ""}
              </p>
            </div>
          </section>
        </div>

        {/* ─────────────────────────────────── */}
        {/* Continue Shopping */}
        {/* ─────────────────────────────────── */}

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-block rounded-xl bg-black px-8 py-4 font-medium text-white transition hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
