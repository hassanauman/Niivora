import { prisma } from "@/lib/prisma";
import FeaturedProductClient from "./FeaturedProductClient";

export default async function FeaturedProduct() {
  const product = await prisma.product.findFirst({
    where: {
      active: true,
      featured: true,
    },
    include: {
      variants: {
        orderBy: {
          price: "asc",
        },
      },
    },
  });

  if (!product || product.variants.length === 0) {
    return null;
  }

  const serializedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    image: product.image,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: Number(variant.price),
      stock: variant.stock,
      sku: variant.sku,
    })),
  };

  return <FeaturedProductClient product={serializedProduct} />;
}
