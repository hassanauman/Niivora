import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      variants: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>

          <p className="mt-2 text-gray-500">Manage your store products.</p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-lg bg-black px-5 py-3 text-white"
        >
          Add Product
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border">
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No products found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">Product</th>
                  <th className="px-6 py-4 text-left">Variants</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Featured</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    {/* Product */}
                    <td className="px-6 py-4 align-top">
                      <div className="font-medium">{product.name}</div>

                      <div className="text-sm text-gray-500">
                        /{product.slug}
                      </div>
                    </td>

                    {/* Variants */}
                    <td className="px-6 py-4">
                      {product.variants.length === 0 ? (
                        <span className="text-sm text-gray-400">
                          No variants
                        </span>
                      ) : (
                        <div className="space-y-3">
                          {product.variants.map((variant) => (
                            <div
                              key={variant.id}
                              className="rounded-lg border bg-gray-50 px-4 py-3"
                            >
                              <div className="font-medium">{variant.name}</div>

                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                <span>${Number(variant.price).toFixed(2)}</span>

                                <span>Stock: {variant.stock}</span>

                                {variant.sku && <span>SKU: {variant.sku}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 align-top">
                      {product.active ? "Active" : "Inactive"}
                    </td>

                    {/* Featured */}
                    <td className="px-6 py-4 align-top">
                      {product.featured ? "Yes" : "No"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 align-top">
                      <div className="flex gap-4">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="font-medium underline"
                        >
                          Edit
                        </Link>

                        <DeleteProductButton productId={product.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
