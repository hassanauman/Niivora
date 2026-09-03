import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type VariantInput = {
  id?: string;
  name: string;
  price: string;
  stock: string;
  sku?: string;
};

type ProductRequestBody = {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active: boolean;
  featured: boolean;
  variants: VariantInput[];
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as ProductRequestBody;

    const name = body.name?.trim();
    const slug = body.slug?.trim();
    const description = body.description?.trim() || null;
    const image = body.image?.trim() || null;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required." },
        { status: 400 },
      );
    }

    const variants = Array.isArray(body.variants) ? body.variants : [];

    if (variants.length === 0) {
      return NextResponse.json(
        { error: "At least one variant is required." },
        { status: 400 },
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    const existingVariantIds = new Set(
      existingProduct.variants.map((variant) => variant.id),
    );

    const variantNames = variants.map((variant) =>
      variant.name.trim().toLowerCase(),
    );

    if (new Set(variantNames).size !== variantNames.length) {
      return NextResponse.json(
        { error: "Variant names must be unique." },
        { status: 400 },
      );
    }

    for (const variant of variants) {
      if (variant.id && !existingVariantIds.has(variant.id)) {
        return NextResponse.json(
          { error: "Invalid variant." },
          { status: 400 },
        );
      }

      const variantName = variant.name.trim();
      const variantPrice = Number(variant.price);
      const variantStock = Number(variant.stock);

      if (
        !variantName ||
        !Number.isFinite(variantPrice) ||
        variantPrice < 0 ||
        !Number.isInteger(variantStock) ||
        variantStock < 0
      ) {
        return NextResponse.json(
          { error: "Invalid variant data." },
          { status: 400 },
        );
      }
    }

    const submittedVariantIds = new Set(
      variants
        .filter((variant) => variant.id)
        .map((variant) => variant.id as string),
    );

    const removedVariants = existingProduct.variants.filter(
      (variant) => !submittedVariantIds.has(variant.id),
    );

    for (const variant of removedVariants) {
      const orderItem = await prisma.orderItem.findFirst({
        where: {
          variantId: variant.id,
        },
        select: {
          id: true,
        },
      });

      if (orderItem) {
        return NextResponse.json(
          {
            error: `Variant "${variant.name}" cannot be removed because it has already been used in an order.`,
          },
          { status: 409 },
        );
      }
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Delete variants that were removed from the product.
      for (const variant of removedVariants) {
        await tx.productVariant.delete({
          where: {
            id: variant.id,
          },
        });
      }

      // Update existing variants and create new ones.
      for (const variant of variants) {
        const variantPrice = Number(variant.price);
        const variantStock = Number(variant.stock);
        const sku = variant.sku?.trim() || null;

        if (variant.id) {
          await tx.productVariant.update({
            where: {
              id: variant.id,
            },
            data: {
              name: variant.name.trim(),
              price: variantPrice.toFixed(2),
              stock: variantStock,
              sku,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              name: variant.name.trim(),
              price: variantPrice.toFixed(2),
              stock: variantStock,
              sku,
            },
          });
        }
      }

      // Update only fields that still belong to Product.
      return tx.product.update({
        where: {
          id,
        },
        data: {
          name,
          slug,
          description,
          image,
          active: Boolean(body.active),
          featured: Boolean(body.featured),
        },
        include: {
          variants: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
    });

    return NextResponse.json({
      product: updatedProduct,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update product.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    const existingOrderItem = await prisma.orderItem.findFirst({
      where: {
        productId: id,
      },
      select: {
        id: true,
      },
    });

    if (existingOrderItem) {
      return NextResponse.json(
        {
          error:
            "This product cannot be deleted because it has already been used in an order. Deactivate the product instead.",
        },
        { status: 409 },
      );
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete product.",
      },
      { status: 500 },
    );
  }
}
