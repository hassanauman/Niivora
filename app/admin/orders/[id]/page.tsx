import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import OrderStatusForm from "@/components/admin/OrderStatusForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminOrderDetailsPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/orders"
            className="text-sm text-gray-500 transition hover:text-black"
          >
            ← Back to Orders
          </Link>

          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-gray-500">Order</p>

              <h1 className="mt-1 font-mono text-2xl font-bold">#{order.id}</h1>

              <p className="mt-2 text-sm text-gray-500">
                Placed on{" "}
                {order.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex gap-3">
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  order.status === "DELIVERED"
                    ? "bg-green-100 text-green-700"
                    : order.status === "CANCELLED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {order.status}
              </span>

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  order.paymentStatus === "PAID"
                    ? "bg-green-100 text-green-700"
                    : order.paymentStatus === "FAILED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-6 lg:col-span-2">
            {/* Products */}
            <section className="rounded-xl border bg-white">
              <div className="border-b p-6">
                <h2 className="text-lg font-semibold">Order Items</h2>
              </div>

              <div className="divide-y">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-6 p-6"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>

                      {item.variantName && (
                        <p className="mt-1 text-sm font-medium text-gray-600">
                          Variant: {item.variantName}
                        </p>
                      )}

                      <p className="mt-2 text-sm text-gray-500">
                        ${Number(item.price).toFixed(2)} × {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Order Summary */}
            <section className="rounded-xl border bg-white p-6">
              <h2 className="mb-6 text-lg font-semibold">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${Number(order.subtotal).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span>-${Number(order.discount).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span>${Number(order.shippingCost).toFixed(2)}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>

                    <span className="text-xl font-bold">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer */}
            <section className="rounded-xl border bg-white p-6">
              <h2 className="mb-5 text-lg font-semibold">Customer</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Name
                  </p>

                  <p className="mt-1">{order.customerName}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm">
                    {order.customerEmail}
                  </p>
                </div>

                {order.user && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Customer Type
                    </p>

                    <p className="mt-1">{order.user.customerType}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Shipping */}
            <section className="rounded-xl border bg-white p-6">
              <h2 className="mb-5 text-lg font-semibold">Shipping Address</h2>

              <div className="space-y-1 text-sm text-gray-600">
                <p>{order.shippingAddress}</p>
                <p>{order.shippingCity}</p>

                {order.shippingPostalCode && <p>{order.shippingPostalCode}</p>}
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-xl border bg-white p-6">
              <h2 className="mb-5 text-lg font-semibold">Payment</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Method
                  </p>

                  <p className="mt-1">
                    {order.paymentMethod || "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Status
                  </p>

                  <p className="mt-1">{order.paymentStatus}</p>
                </div>
              </div>
            </section>

            <OrderStatusForm
              orderId={order.id}
              currentStatus={order.status}
              currentPaymentStatus={order.paymentStatus}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
