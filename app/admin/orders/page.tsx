import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm text-gray-500 transition hover:text-black"
          >
            ← Back to Admin Dashboard
          </Link>

          <div className="mt-4">
            <h1 className="text-4xl font-bold tracking-tight">Orders</h1>
            <p className="mt-2 text-gray-500">
              Manage and track customer orders.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <h2 className="text-xl font-semibold">No orders yet</h2>
            <p className="mt-2 text-gray-500">
              Customer orders will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold">Order</th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">Items</th>

                    <th className="px-6 py-4 text-sm font-semibold">Total</th>

                    <th className="px-6 py-4 text-sm font-semibold">Status</th>

                    <th className="px-6 py-4 text-sm font-semibold">Payment</th>

                    <th className="px-6 py-4 text-sm font-semibold">Date</th>

                    <th className="px-6 py-4 text-sm font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {orders.map((order) => {
                    const itemCount = order.items.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    );

                    return (
                      <tr
                        key={order.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-5">
                          <p className="font-mono text-sm font-medium">
                            #{order.id}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-medium">{order.customerName}</p>

                          <p className="mt-1 text-sm text-gray-500">
                            {order.customerEmail}
                          </p>
                        </td>

                        <td className="min-w-64 px-6 py-5">
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-lg border bg-gray-50 p-3"
                              >
                                <p className="font-medium">
                                  {item.productName}
                                </p>

                                {item.variantName && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    Variant: {item.variantName}
                                  </p>
                                )}

                                <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                                  <span>Qty: {item.quantity}</span>

                                  <span>•</span>

                                  <span>${Number(item.price).toFixed(2)}</span>
                                </div>
                              </div>
                            ))}

                            <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm">
                              {itemCount} {itemCount === 1 ? "item" : "items"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-semibold">
                            ${Number(order.total).toFixed(2)}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              order.status === "DELIVERED"
                                ? "bg-green-100 text-green-700"
                                : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              order.paymentStatus === "PAID"
                                ? "bg-green-100 text-green-700"
                                : order.paymentStatus === "FAILED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">
                          {order.createdAt.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        <td className="px-6 py-5">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
