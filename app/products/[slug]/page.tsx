import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/app/components/AddToCartButton";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    include: {
      variants: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!product || !product.active) {
    notFound();
  }

  if (product.variants.length === 0) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/products"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to Products
        </Link>

        <div className="mt-8 grid gap-12 md:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            {product.featured && (
              <span className="mb-4 text-sm font-medium uppercase tracking-wider text-purple-600">
                Featured
              </span>
            )}

            <h1 className="text-4xl font-bold">{product.name}</h1>

            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                image: product.image,
              }}
              variants={product.variants.map((variant) => ({
                id: variant.id,
                name: variant.name,
                price: Number(variant.price),
                stock: variant.stock,
                sku: variant.sku,
              }))}
            />

            {product.description && (
              <div className="mt-8">
                <h2 className="font-semibold">Description</h2>

                <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
