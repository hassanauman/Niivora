import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function FeaturedProduct() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      variants: { orderBy: { price: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section id="shop" className="w-full scroll-mt-20 bg-cream px-6 py-14 sm:px-10 md:px-16 md:py-20">
      <div className="mx-auto max-w-350">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-gold">The collection</p>
            <h2 className="font-playfair text-3xl text-charcoal sm:text-4xl md:text-5xl">Find Your NIIVORA Ritual.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-charcoal/70">
              Explore each product individually, with its own details, available options, and purchase page.
            </p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 self-start text-xs uppercase tracking-widest text-charcoal hover:text-gold sm:self-auto">
            View all products <ArrowRight size={15} />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="border border-charcoal/15 p-10 text-center text-sm text-charcoal/70">
            Our collection is being prepared. Please check back soon.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const prices = product.variants.map((variant) => Number(variant.price));
              const lowest = prices.length ? Math.min(...prices) : null;
              const highest = prices.length ? Math.max(...prices) : null;
              const stock = product.variants.reduce((total, variant) => total + variant.stock, 0);

              return (
                <article key={product.id} className="group overflow-hidden border border-charcoal/15 bg-white/40">
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative aspect-[4/4.5] overflow-hidden bg-[#e7dfd1]">
                      {product.image ? (
                        // Product imagery is sourced from the product record, not generated placeholders.
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-charcoal/60">Product image coming soon</div>
                      )}
                    </div>
                  </Link>
                  <div className="p-5 sm:p-6">
                    <h3 className="font-playfair text-2xl text-charcoal">{product.name}</h3>
                    <p className="mt-2 min-h-10 text-sm leading-6 text-charcoal/70">
                      {product.description ?? "Explore the product details and ingredients."}
                    </p>
                    {lowest !== null && highest !== null && (
                      <p className="mt-4 text-sm font-medium text-charcoal">
                        {lowest === highest
                          ? `PKR ${lowest.toLocaleString("en-PK")}`
                          : `PKR ${lowest.toLocaleString("en-PK")} – ${highest.toLocaleString("en-PK")}`}
                      </p>
                    )}
                    <p className={`mt-2 text-xs uppercase tracking-widest ${stock > 0 ? "text-charcoal/60" : "text-red-700"}`}>
                      {stock > 0 ? "Available" : "Out of stock"}
                    </p>
                    <Link href={`/products/${product.slug}`} className="mt-5 flex w-full items-center justify-between border border-charcoal px-4 py-3 text-xs uppercase tracking-widest text-charcoal transition hover:bg-charcoal hover:text-offwhite">
                      Explore product <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
