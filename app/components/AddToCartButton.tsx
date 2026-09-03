"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";

type Variant = {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
};

type AddToCartButtonProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };
  variants: Variant[];
};

export default function AddToCartButton({
  product,
  variants,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState(
    variants[0]?.id ?? "",
  );

  const selectedVariant = variants.find(
    (variant) => variant.id === selectedVariantId,
  );

  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  function handleAddToCart() {
    if (!selectedVariant || isOutOfStock) return;

    addToCart({
      id: product.id,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      name: product.name,
      slug: product.slug,
      price: selectedVariant.price,
      image: product.image,
      quantity: 1,
      stock: selectedVariant.stock,
    });
  }

  return (
    <div className="mt-6">
      {/* Variant selector */}
      {variants.length > 1 && (
        <div>
          <label
            htmlFor="product-variant"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Select variant
          </label>

          <select
            id="product-variant"
            value={selectedVariantId}
            onChange={(event) => setSelectedVariantId(event.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
          >
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name}
                {variant.stock <= 0 ? " — Out of Stock" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Price */}
      {selectedVariant && (
        <div className="mt-5">
          <span className="text-2xl font-semibold">
            ${selectedVariant.price.toFixed(2)}
          </span>
        </div>
      )}

      {/* Stock */}
      <div className="mt-4">
        {isOutOfStock ? (
          <p className="font-medium text-red-500">Out of stock</p>
        ) : (
          <p className="text-sm text-gray-500">
            {selectedVariant.stock}{" "}
            {selectedVariant.stock === 1 ? "item" : "items"} available
          </p>
        )}
      </div>

      {/* Add to Cart */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="mt-6 w-full rounded-xl bg-black px-6 py-4 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}
