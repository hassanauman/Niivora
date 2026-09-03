import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      variants: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const serializedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    image: product.image,
    active: product.active,
    featured: product.featured,

    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: Number(variant.price),
      stock: variant.stock,
      sku: variant.sku,
    })),
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Edit Product</h1>

        <p className="mt-2 text-gray-500">Update your product information.</p>

        <div className="mt-8">
          <ProductForm product={serializedProduct} />
        </div>
      </div>
    </main>
  );
}
