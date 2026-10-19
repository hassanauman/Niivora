"use client";

import { useState } from "react";
import Image from "next/image";
import { Banknote, Minus, Plus, Truck } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

type Variant = {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  variants: Variant[];
};

type FeaturedProductClientProps = {
  product: Product;
};

const PRODUCT_DETAILS = [
  "Features black seed oil, jojoba oil, rosemary oil, and vitamin E",
  "Made for scalp massage and your regular hair-care routine",
  "Follow the product label for application instructions",
  "Patch test before first use; external use only",
];

export default function FeaturedProductClient({ product }: FeaturedProductClientProps) {
  const { addToCart } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId);
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  const addSelectedToCart = () => {
    if (!selectedVariant || isOutOfStock) return;
    addToCart({
      id: product.id,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      name: product.name,
      slug: product.slug,
      price: selectedVariant.price,
      image: product.image,
      quantity,
      stock: selectedVariant.stock,
    });
  };

  return (
    <section id="shop" className="w-full scroll-mt-20 bg-cream">
      <div className="mx-auto grid max-w-350 grid-cols-1 lg:grid-cols-[38%_34%_28%]">
        <div className="relative h-87.5 sm:h-112.5 lg:h-117.5">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 38vw" />
          ) : (
            <div className="flex h-full items-center justify-center bg-offwhite">
              <p className="font-jost text-sm uppercase tracking-[0.15em] text-warmgrey">Product image coming soon</p>
            </div>
          )}
        </div>
        <div className="px-6 py-10 font-jost sm:px-10 sm:py-12">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-gold">The NIIVORA formula</p>
          <h2 className="mb-3 font-serif text-2xl text-charcoal sm:text-3xl">{product.name}</h2>
          {selectedVariant && <p className="mb-4 text-lg font-semibold text-charcoal">PKR {selectedVariant.price.toLocaleString("en-PK")}</p>}
          {product.description && <p className="mb-5 max-w-sm text-sm leading-relaxed text-charcoal/70">{product.description}</p>}
          <ul className="flex flex-col gap-2">
            {PRODUCT_DETAILS.map((detail) => (
              <li key={detail} className="flex items-start gap-2 text-sm text-charcoal/80">
                <span className="mt-0.5 text-gold">•</span>{detail}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-6 px-6 py-10 font-jost sm:px-10 sm:py-12">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-charcoal/60">Option</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => {
                const selected = variant.id === selectedVariantId;
                return (
                  <button key={variant.id} type="button" disabled={variant.stock <= 0}
                    onClick={() => { setSelectedVariantId(variant.id); setQuantity(1); }}
                    className={`border px-3 py-3 text-xs uppercase tracking-wide transition-colors ${selected ? "border-gold bg-gold text-espresso" : "border-warmgrey text-charcoal/70 hover:border-charcoal"} ${variant.stock <= 0 ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}>
                    {variant.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center border border-warmgrey">
              <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={isOutOfStock || quantity <= 1} className="flex h-11 w-9 items-center justify-center text-charcoal disabled:opacity-30" aria-label="Decrease quantity"><Minus size={14} /></button>
              <span className="w-8 text-center text-sm text-charcoal">{quantity}</span>
              <button type="button" onClick={() => selectedVariant && setQuantity((current) => Math.min(selectedVariant.stock, current + 1))} disabled={isOutOfStock || !selectedVariant || quantity >= selectedVariant.stock} className="flex h-11 w-9 items-center justify-center text-charcoal disabled:opacity-30" aria-label="Increase quantity"><Plus size={14} /></button>
            </div>
            <button type="button" onClick={addSelectedToCart} disabled={isOutOfStock} className="flex-1 bg-gold text-xs uppercase tracking-widest text-espresso disabled:opacity-40">{isOutOfStock ? "Out of Stock" : "Add to Cart"}</button>
          </div>
          <button type="button" onClick={() => { addSelectedToCart(); if (selectedVariant && !isOutOfStock) window.location.href = "/checkout"; }} disabled={isOutOfStock} className="w-full bg-espresso py-3 text-xs uppercase tracking-widest text-offwhite disabled:opacity-40">Buy It Now</button>
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-start gap-2 text-xs text-charcoal/70"><Truck size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" /><span><strong className="text-charcoal">Free Shipping</strong> on orders above PKR 3,000</span></div>
            <div className="flex items-start gap-2 text-xs text-charcoal/70"><Banknote size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" /><span>Cash on Delivery available across Pakistan</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
