import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="mt-2 text-gray-500">Welcome back, {session.user.name}.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/orders" className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800">
              Manage Orders
            </Link>
            <Link href="/admin/products" className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium transition hover:bg-gray-100">
              Manage Products
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/products" className="rounded-xl border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-gray-500">Products</p>
            <p className="mt-3 text-lg font-semibold">Manage Products →</p>
          </Link>
          <Link href="/admin/orders" className="rounded-xl border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-gray-500">Orders</p>
            <p className="mt-3 text-lg font-semibold">Manage Orders →</p>
          </Link>
          <Link href="/admin/users" className="rounded-xl border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-gray-500">Customers</p>
            <p className="mt-3 text-lg font-semibold">Manage Customers →</p>
          </Link>
          <Link href="/admin/withdrawals" className="rounded-xl border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-gray-500">Founder Wallet</p>
            <p className="mt-3 text-lg font-semibold">Withdrawals →</p>
          </Link>
        </div>

        <div className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin/orders" className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800">Manage Orders</Link>
            <Link href="/admin/products/new" className="rounded-lg border px-5 py-3 text-sm font-medium transition hover:bg-gray-100">Add Product</Link>
            <Link href="/admin/products" className="rounded-lg border px-5 py-3 text-sm font-medium transition hover:bg-gray-100">Manage Products</Link>
            <Link href="/admin/users" className="rounded-lg border px-5 py-3 text-sm font-medium transition hover:bg-gray-100">Manage Customers</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
