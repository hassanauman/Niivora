import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type VariantInput = {
  name: string;
  price: string | number;
  stock: string | number;
  sku?: string;
};

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
      },
      include: {
        variants: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Products API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 },
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const { name, slug, description, image, active, featured, variants } = body;

    if (!name || !slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and slug are required",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one variant is required",
        },
        { status: 400 },
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        slug: String(slug).trim(),
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "A product with this slug already exists",
        },
        { status: 409 },
      );
    }

    const productVariants = (variants as VariantInput[]).map((variant) => ({
      name: String(variant.name).trim(),
      price: Number(variant.price),
      stock: Number(variant.stock),
      sku:
        typeof variant.sku === "string" && variant.sku.trim()
          ? variant.sku.trim()
          : null,
    }));

    for (const variant of productVariants) {
      if (!variant.name) {
        return NextResponse.json(
          {
            success: false,
            message: "Every variant must have a name",
          },
          { status: 400 },
        );
      }

      if (!Number.isFinite(variant.price) || variant.price < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Every variant must have a valid price",
          },
          { status: 400 },
        );
      }

      if (!Number.isInteger(variant.stock) || variant.stock < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Every variant must have a valid stock quantity",
          },
          { status: 400 },
        );
      }
    }

    const variantNames = productVariants.map((variant) =>
      variant.name.toLowerCase(),
    );

    if (new Set(variantNames).size !== variantNames.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Variant names must be unique",
        },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        slug: String(slug).trim(),
        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
        image: typeof image === "string" && image.trim() ? image.trim() : null,
        active: Boolean(active),
        featured: Boolean(featured),
        variants: {
          create: productVariants,
        },
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product",
      },
      { status: 500 },
    );
  }
}
