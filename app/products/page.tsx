import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
    },
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
  });

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Our Products</h1>

          <p className="mt-3 text-gray-500">Explore our collection.</p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border p-12 text-center text-gray-500">
            No products available.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const variants = product.variants;

              const prices = variants.map((variant) => Number(variant.price));

              const lowestPrice = Math.min(...prices);
              const highestPrice = Math.max(...prices);

              const totalStock = variants.reduce(
                (total, variant) => total + variant.stock,
                0,
              );

              const hasVariants = variants.length > 1;
              const allOutOfStock = totalStock <= 0;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group overflow-hidden rounded-xl border bg-white transition hover:shadow-lg"
                >
                  <div className="aspect-square bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h2 className="font-semibold">{product.name}</h2>

                    <div className="mt-2">
                      {hasVariants && lowestPrice !== highestPrice ? (
                        <span className="font-medium">
                          ${lowestPrice.toFixed(2)} – ${highestPrice.toFixed(2)}
                        </span>
                      ) : (
                        <span className="font-medium">
                          ${lowestPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {allOutOfStock && (
                      <p className="mt-3 text-sm text-red-500">Out of stock</p>
                    )}

                    {!allOutOfStock && hasVariants && (
                      <p className="mt-3 text-sm text-gray-500">
                        {variants.length} variants available
                      </p>
                    )}

                    {product.featured && (
                      <span className="mt-3 inline-block text-xs font-medium uppercase tracking-wide text-purple-600">
                        Featured
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
