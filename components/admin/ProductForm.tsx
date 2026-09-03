"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Variant = {
  id?: string;
  name: string;
  price: number | string;
  stock: number | string;
  sku: string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  active: boolean;
  featured: boolean;
  variants: Variant[];
};

type ProductFormProps = {
  product?: Product;
};

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [image, setImage] = useState(product?.image ?? "");
  const [active, setActive] = useState(product?.active ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);

  const [variants, setVariants] = useState<Variant[]>(
    product?.variants?.length
      ? product.variants
      : [
          {
            name: "Default",
            price: "",
            stock: "0",
            sku: null,
          },
        ],
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        name: "",
        price: "",
        stock: "0",
        sku: null,
      },
    ]);
  }

  function removeVariant(index: number) {
    setVariants((current) =>
      current.filter((_, variantIndex) => variantIndex !== index),
    );
  }

  function updateVariant(
    index: number,
    field: "name" | "price" | "stock" | "sku",
    value: string,
  ) {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (variants.length === 0) {
        throw new Error("At least one variant is required.");
      }

      const url = isEditing
        ? `/api/admin/products/${product!.id}`
        : "/api/admin/products";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
          description,
          image,
          active,
          featured,
          variants: variants.map((variant) => ({
            ...(variant.id ? { id: variant.id } : {}),
            name: variant.name,
            price: String(variant.price),
            stock: String(variant.stock),
            sku: variant.sku || "",
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div>
        <label className="mb-2 block text-sm font-medium">Product Name</label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border px-4 py-3 outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Slug</label>

        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          className="w-full rounded-lg border px-4 py-3 outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Description</label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full rounded-lg border px-4 py-3 outline-none"
        />
      </div>

      {/* Variants */}
      <div className="rounded-lg border p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Variants</h2>

            <p className="mt-1 text-sm text-gray-500">
              Create different options with their own price, stock, and SKU.
            </p>
          </div>

          <button
            type="button"
            onClick={addVariant}
            className="shrink-0 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            + Add Variant
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {variants.map((variant, index) => (
            <div
              key={variant.id ?? `new-${index}`}
              className="rounded-lg border bg-gray-50 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium">Variant {index + 1}</span>

                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Variant Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Variant Name
                  </label>

                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) =>
                      updateVariant(index, "name", e.target.value)
                    }
                    placeholder="e.g. 100ml"
                    required
                    className="w-full rounded-lg border bg-white px-4 py-3 outline-none"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="mb-2 block text-sm font-medium">SKU</label>

                  <input
                    type="text"
                    value={variant.sku ?? ""}
                    onChange={(e) =>
                      updateVariant(index, "sku", e.target.value)
                    }
                    placeholder="e.g. NIV-100"
                    className="w-full rounded-lg border bg-white px-4 py-3 outline-none"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Price
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(index, "price", e.target.value)
                    }
                    required
                    className="w-full rounded-lg border bg-white px-4 py-3 outline-none"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(e) =>
                      updateVariant(index, "stock", e.target.value)
                    }
                    required
                    className="w-full rounded-lg border bg-white px-4 py-3 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image */}
      <div>
        <label className="mb-2 block text-sm font-medium">Image URL</label>

        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full rounded-lg border px-4 py-3 outline-none"
        />
      </div>

      {/* Status */}
      <div className="space-y-4 rounded-lg border p-5">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />

          <span className="text-sm font-medium">Active product</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />

          <span className="text-sm font-medium">Featured product</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-lg border px-5 py-3"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Create Product"}
        </button>
      </div>
    </form>
  );
}
