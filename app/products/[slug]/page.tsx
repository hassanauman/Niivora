import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/app/components/AddToCartButton";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Support both canonical slugs and older product URLs built from product names.
  const normalizedSlug = slug
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { slug },
        { slug: normalizedSlug },
        { name: { equals: slug, mode: "insensitive" } },
      ],
    },
    include: { variants: { orderBy: { createdAt: "asc" } } },
  });

  // A product can exist before its variants are configured. Keep its detail page
  // accessible; only missing or inactive products should return a 404.
  if (!product || !product.active) notFound();

  return (
    <main className="min-h-screen bg-espresso text-offwhite">
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-16">
        <Link href="/products" className="text-xs uppercase tracking-widest text-gold">
          ← Back to collection
        </Link>
        <div className="mt-8 grid gap-10 md:grid-cols-2 lg:gap-16">
          <div className="aspect-square overflow-hidden rounded-3xl border border-bronze/30 bg-charcoal/50">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-warmgrey">
                Product image coming soon
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            {product.featured && (
              <span className="text-xs uppercase tracking-[.2em] text-gold">Featured</span>
            )}
            <h1 className="mt-3 font-playfair text-5xl sm:text-6xl">{product.name}</h1>
            <div className="mt-7">
              {product.variants.length > 0 ? (
                <AddToCartButton
                  product={{ id: product.id, name: product.name, slug: product.slug, image: product.image }}
                  variants={product.variants.map((variant) => ({
                    id: variant.id,
                    name: variant.name,
                    price: Number(variant.price),
                    stock: variant.stock,
                    sku: variant.sku,
                  }))}
                />
              ) : (
                <p className="rounded-xl border border-bronze/30 p-4 text-sm text-warmgrey">
                  This product is being prepared and is not available to purchase yet.
                </p>
              )}
            </div>
            {product.description && (
              <div className="mt-10 border-t border-bronze/30 pt-7">
                <p className="text-xs uppercase tracking-[.2em] text-gold">About this product</p>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-warmgrey">
                  {product.description}
                </p>
              </div>
            )}
            <div className="mt-10 border-t border-bronze/30 pt-7">
              <p className="text-xs uppercase tracking-[.2em] text-gold">Key ingredients</p>
              <p className="mt-4 text-sm leading-7 text-warmgrey">
                Black seed oil, jojoba oil, rosemary oil, and vitamin E.
              </p>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 text-xs uppercase tracking-widest">
              <div className="rounded-xl border border-bronze/30 p-4 text-warmgrey">
                External use only
              </div>
              <div className="rounded-xl border border-bronze/30 p-4 text-warmgrey">
                Patch test before use
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
