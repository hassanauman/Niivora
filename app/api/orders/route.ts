import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type OrderItemInput = {
  id: string;
  variantId: string;
  quantity: number;
};

type OrderRequestBody = {
  items: OrderItemInput[];
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode?: string;
  paymentMethod?: string;
};

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "You must be logged in to place an order.",
        },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const body = (await request.json()) as OrderRequestBody;

    const items = Array.isArray(body.items) ? body.items : [];

    const customerName =
      typeof body.customerName === "string" ? body.customerName.trim() : "";

    const customerEmail =
      typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";

    const shippingAddress =
      typeof body.shippingAddress === "string"
        ? body.shippingAddress.trim()
        : "";

    const shippingCity =
      typeof body.shippingCity === "string" ? body.shippingCity.trim() : "";

    const shippingPostalCode =
      typeof body.shippingPostalCode === "string"
        ? body.shippingPostalCode.trim()
        : "";

    const paymentMethod =
      typeof body.paymentMethod === "string" ? body.paymentMethod.trim() : "";

    if (items.length === 0) {
      return NextResponse.json(
        {
          error: "Your cart is empty.",
        },
        { status: 400 },
      );
    }

    if (!customerName || !customerEmail || !shippingAddress || !shippingCity) {
      return NextResponse.json(
        {
          error: "Please complete all required customer and shipping fields.",
        },
        { status: 400 },
      );
    }

    if (paymentMethod !== "COD") {
      return NextResponse.json(
        {
          error: "Invalid payment method.",
        },
        { status: 400 },
      );
    }

    for (const item of items) {
      if (
        typeof item.id !== "string" ||
        typeof item.variantId !== "string" ||
        !item.variantId ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          {
            error: "Invalid cart item.",
          },
          { status: 400 },
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        customerType: true,
        founderDiscount: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        { status: 404 },
      );
    }

    const productIds = items.map((item) => item.id);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        active: true,
      },
      include: {
        variants: true,
      },
    });

    if (products.length !== new Set(productIds).size) {
      return NextResponse.json(
        {
          error: "One or more products are unavailable.",
        },
        { status: 400 },
      );
    }

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;

      // Prisma will infer the correct type when we pass this
      // into the Order create operation.
      const orderItems = items.map((item) => {
        const product = productMap.get(item.id);

        if (!product) {
          throw new Error("Product not found.");
        }

        const variant = product.variants.find(
          (variant) => variant.id === item.variantId,
        );

        if (!variant) {
          throw new Error(`Invalid variant selected for ${product.name}.`);
        }

        if (variant.stock < item.quantity) {
          throw new Error(
            `Not enough stock available for ${product.name} - ${variant.name}.`,
          );
        }

        const price = Number(variant.price);

        subtotal += price * item.quantity;

        return {
          productId: product.id,
          variantId: variant.id,
          variantName: variant.name,
          productName: product.name,
          productSlug: product.slug,
          price: variant.price,
          quantity: item.quantity,
        };
      });

      let discount = 0;

      if (user.customerType === "FOUNDER" && user.founderDiscount) {
        const discountPercentage = Number(user.founderDiscount);

        discount = subtotal * (discountPercentage / 100);
      }

      const shippingCost = 0;

      const total = Math.max(0, subtotal - discount + shippingCost);

      const createdOrder = await tx.order.create({
        data: {
          userId,

          status: "PENDING",
          paymentStatus: "PENDING",

          subtotal: subtotal.toFixed(2),
          shippingCost: shippingCost.toFixed(2),
          discount: discount.toFixed(2),
          total: total.toFixed(2),

          customerName,
          customerEmail,
          shippingAddress,
          shippingCity,
          shippingPostalCode: shippingPostalCode || null,
          paymentMethod,

          items: {
            create: orderItems,
          },
        },

        include: {
          items: true,
        },
      });

      // Decrease variant stock
      for (const item of items) {
        await tx.productVariant.update({
          where: {
            id: item.variantId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return createdOrder;
    });

    return NextResponse.json(
      {
        message: "Order created successfully.",
        orderId: result.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("ORDER CREATION ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating the order.",
      },
      { status: 500 },
    );
  }
}
