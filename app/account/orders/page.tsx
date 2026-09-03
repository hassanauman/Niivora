import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MyOrdersPage() {
  // ─────────────────────────────────────────
  // 1. Check authentication
  // ─────────────────────────────────────────

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/orders");
  }

  // ─────────────────────────────────────────
  // 2. Get customer's orders
  // ─────────────────────────────────────────

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/account"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to Account
          </Link>

          <h1 className="mt-4 text-4xl font-bold">My Orders</h1>

          <p className="mt-2 text-gray-500">View and track your orders.</p>
        </div>

        {/* No Orders */}
        {orders.length === 0 ? (
          <div className="rounded-xl border p-12 text-center">
            <h2 className="text-xl font-semibold">No orders yet</h2>

            <p className="mt-2 text-gray-500">
              You haven't placed any orders yet.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          /* Orders */
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border">
                {/* Order Header */}
                <div className="flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm text-gray-500">Order</p>

                    <p className="mt-1 font-mono text-sm font-medium">
                      #{order.id}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {order.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium">
                      {order.status}
                    </span>

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="divide-y">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 p-6"
                    >
                      <div>
                        <p className="font-medium">{item.productName}</p>

                        <p className="mt-1 text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="font-medium">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex flex-col justify-between gap-4 border-t bg-gray-50 p-6 sm:flex-row sm:items-center">
                  <div>
                    <span className="text-sm text-gray-500">Total</span>

                    <p className="text-xl font-bold">
                      ${order.total.toString()}
                    </p>
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="rounded-lg bg-black px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    View Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
