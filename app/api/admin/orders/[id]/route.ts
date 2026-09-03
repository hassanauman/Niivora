import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    const validPaymentStatuses = ["PENDING", "PAID", "FAILED"];

    if (status !== undefined && !validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid order status." },
        { status: 400 },
      );
    }

    if (
      paymentStatus !== undefined &&
      !validPaymentStatuses.includes(paymentStatus)
    ) {
      return NextResponse.json(
        { message: "Invalid payment status." },
        { status: 400 },
      );
    }

    if (status === undefined && paymentStatus === undefined) {
      return NextResponse.json(
        { message: "Nothing to update." },
        { status: 400 },
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 },
      );
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      /*
       * Restore variant stock when the order is
       * cancelled for the first time.
       */
      if (status === "CANCELLED" && existingOrder.status !== "CANCELLED") {
        for (const item of existingOrder.items) {
          if (!item.variantId) {
            throw new Error(`Order item ${item.id} has no variant.`);
          }

          await tx.productVariant.update({
            where: {
              id: item.variantId,
            },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      /*
       * If an already-cancelled order is changed back
       * to another status, reserve the variant stock again.
       */
      if (
        existingOrder.status === "CANCELLED" &&
        status !== undefined &&
        status !== "CANCELLED"
      ) {
        for (const item of existingOrder.items) {
          if (!item.variantId) {
            throw new Error(`Order item ${item.id} has no variant.`);
          }

          const variant = await tx.productVariant.findUnique({
            where: {
              id: item.variantId,
            },
            select: {
              stock: true,
              name: true,
            },
          });

          if (!variant) {
            throw new Error(`Variant ${item.variantId} not found.`);
          }

          if (variant.stock < item.quantity) {
            throw new Error(`Not enough stock for ${variant.name}.`);
          }

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
      }

      return tx.order.update({
        where: {
          id,
        },
        data: {
          ...(status !== undefined && {
            status,
          }),
          ...(paymentStatus !== undefined && {
            paymentStatus,
          }),
        },
      });
    });

    return NextResponse.json({
      message: "Order updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("ADMIN ORDER UPDATE ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}
