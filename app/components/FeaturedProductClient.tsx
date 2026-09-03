"use client";

import { useState } from "react";
import Image from "next/image";
import { Banknote, Minus, Plus, Star, Truck } from "lucide-react";
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

const BENEFITS = [
  "Strengthens roots & reduces hair fall",
  "Promotes thicker, healthier hair",
  "Reduces dandruff & dryness",
  "For all hair types",
];

export default function FeaturedProductClient({
  product,
}: FeaturedProductClientProps) {
  const { addToCart } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? "",
  );

  const [quantity, setQuantity] = useState(1);

  const selectedVariant = product.variants.find(
    (variant) => variant.id === selectedVariantId,
  );

  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    if (!selectedVariant) return;

    setQuantity((current) => Math.min(selectedVariant.stock, current + 1));
  };

  const handleAddToCart = () => {
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

  const handleBuyNow = () => {
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

    window.location.href = "/checkout";
  };

  return (
    <section id="shop" className="w-full scroll-mt-20 bg-cream">
      <div className="mx-auto grid max-w-350 grid-cols-1 lg:grid-cols-[38%_34%_28%]">
        {/* Left — product image */}
        <div className="relative h-87.5 sm:h-112.5 lg:h-117.5">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 38vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-offwhite">
              <p className="font-jost text-sm uppercase tracking-[0.15em] text-warmgrey">
                No image
              </p>
            </div>
          )}
        </div>

        {/* Middle — product info */}
        <div className="px-6 py-10 font-jost sm:px-10 sm:py-12">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-gold">
            Best Seller
          </p>

          <h2 className="mb-1 font-serif text-2xl text-charcoal sm:text-3xl">
            {product.name}
          </h2>

          {selectedVariant && (
            <p className="mb-3 text-sm text-charcoal/60">
              {selectedVariant.name}
            </p>
          )}

          <div className="mb-4 flex items-center gap-2">
            <div className="flex text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <span className="text-xs text-charcoal/70">4.9 (482 Reviews)</span>
          </div>

          {selectedVariant && (
            <p className="mb-4 text-lg font-semibold text-charcoal">
              Rs. {selectedVariant.price.toLocaleString()}.00
            </p>
          )}

          {product.description && (
            <p className="mb-5 max-w-sm text-sm leading-relaxed text-charcoal/70">
              {product.description}
            </p>
          )}

          <ul className="flex flex-col gap-2">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2 text-sm text-charcoal/80"
              >
                <span className="mt-0.5 text-gold">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — purchase panel */}
        <div className="flex flex-col gap-6 px-6 py-10 font-jost sm:px-10 sm:py-12">
          {/* Size selector — button group */}
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-charcoal/60">
              Size
            </p>
            <div className="flex gap-2">
              {product.variants.map((v) => {
                const isSelected = v.id === selectedVariantId;
                const variantOutOfStock = v.stock <= 0;

                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={variantOutOfStock}
                    onClick={() => handleVariantChange(v.id)}
                    className={`flex-1 border px-3 py-3 text-xs uppercase tracking-wide transition-colors ${
                      isSelected
                        ? "border-gold bg-gold text-espresso"
                        : "border-warmgrey text-charcoal/70 hover:border-charcoal"
                    } ${
                      variantOutOfStock
                        ? "cursor-not-allowed opacity-40"
                        : "cursor-pointer"
                    }`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex gap-3">
            <div className="flex items-center border border-warmgrey">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={isOutOfStock || quantity <= 1}
                className="flex h-11 w-9 items-center justify-center text-charcoal disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm text-charcoal">
                {quantity}
              </span>
              <button
                type="button"
                onClick={increaseQuantity}
                disabled={
                  isOutOfStock ||
                  !selectedVariant ||
                  quantity >= selectedVariant.stock
                }
                className="flex h-11 w-9 items-center justify-center text-charcoal disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 cursor-pointer bg-gold text-xs uppercase tracking-widest text-espresso disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>

          {/* Buy it now */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="w-full cursor-pointer bg-espresso py-3 text-xs uppercase tracking-widest text-offwhite disabled:cursor-not-allowed disabled:opacity-40"
          >
            Buy It Now
          </button>

          {/* Trust info */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-start gap-2 text-xs text-charcoal/70">
              <Truck size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
              <span>
                <strong className="text-charcoal">Free Shipping</strong> on
                orders above PKR 3,000
              </span>
            </div>
            <div className="flex items-start gap-2 text-xs text-charcoal/70">
              <Banknote
                size={16}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0"
              />
              <span>Cash on Delivery available across Pakistan</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
