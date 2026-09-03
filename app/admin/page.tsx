import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [
    totalProducts,
    activeProducts,
    featuredProducts,
    totalCustomers,
    lowStockProducts,
    recentProducts,
  ] = await Promise.all([
    prisma.product.count(),

    prisma.product.count({
      where: {
        active: true,
      },
    }),

    prisma.product.count({
      where: {
        featured: true,
      },
    }),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    }),

    prisma.product.count({
      where: {
        variants: {
          every: {
            stock: {
              lte: 10,
            },
          },
        },
      },
    }),

    prisma.product.findMany({
      include: {
        variants: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <p className="mt-2 text-gray-500">
              Welcome back, {session.user.name}.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Manage Products
          </Link>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Products */}
          <div className="rounded-xl border bg-white p-6">
            <p className="text-sm text-gray-500">Total Products</p>

            <p className="mt-2 text-3xl font-bold">{totalProducts}</p>

            <p className="mt-2 text-sm text-gray-500">
              All products in your store
            </p>
          </div>

          {/* Active Products */}
          <div className="rounded-xl border bg-white p-6">
            <p className="text-sm text-gray-500">Active Products</p>

            <p className="mt-2 text-3xl font-bold">{activeProducts}</p>

            <p className="mt-2 text-sm text-gray-500">
              Currently visible in store
            </p>
          </div>

          {/* Customers */}
          <div className="rounded-xl border bg-white p-6">
            <p className="text-sm text-gray-500">Customers</p>

            <p className="mt-2 text-3xl font-bold">{totalCustomers}</p>

            <p className="mt-2 text-sm text-gray-500">Registered customers</p>
          </div>

          {/* Low Stock */}
          <div className="rounded-xl border bg-white p-6">
            <p className="text-sm text-gray-500">Low Stock</p>

            <p className="mt-2 text-3xl font-bold">{lowStockProducts}</p>

            <p className="mt-2 text-sm text-gray-500">
              Products with 10 or fewer items per variant
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Recent Products */}
          <div className="rounded-xl border bg-white lg:col-span-2">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-lg font-semibold">Recent Products</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your latest products
                </p>
              </div>

              <Link
                href="/admin/products"
                className="text-sm font-medium underline"
              >
                View all
              </Link>
            </div>

            {recentProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No products yet.
              </div>
            ) : (
              <div>
                {recentProducts.map((product) => {
                  const variantPrices = product.variants.map((variant) =>
                    Number(variant.price),
                  );

                  const lowestPrice =
                    variantPrices.length > 0 ? Math.min(...variantPrices) : 0;

                  const totalStock = product.variants.reduce(
                    (total, variant) => total + variant.stock,
                    0,
                  );

                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between border-b p-6 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>

                        <p className="mt-1 text-sm text-gray-500">
                          /{product.slug}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-medium">
                          From ${lowestPrice.toFixed(2)}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {totalStock} total in stock
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Store Overview */}
          <div className="rounded-xl border bg-white">
            <div className="border-b p-6">
              <h2 className="text-lg font-semibold">Store Overview</h2>

              <p className="mt-1 text-sm text-gray-500">Current store status</p>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Products</span>

                <span className="font-medium">{totalProducts}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Active</span>

                <span className="font-medium">{activeProducts}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Featured</span>

                <span className="font-medium">{featuredProducts}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Customers</span>

                <span className="font-medium">{totalCustomers}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Low Stock</span>

                <span className="font-medium">{lowStockProducts}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Quick Actions</h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin/products/new"
              className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
            >
              Add Product
            </Link>

            <Link
              href="/admin/products"
              className="rounded-lg border px-5 py-3 text-sm font-medium"
            >
              Manage Products
            </Link>

            <Link
              href="/admin/users"
              className="rounded-lg border px-5 py-3 text-sm font-medium"
            >
              Manage Customers
            </Link>

            <Link
              href="/account"
              className="rounded-lg border px-5 py-3 text-sm font-medium"
            >
              View Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
