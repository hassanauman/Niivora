import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    // Must be logged in
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Must be an admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const body = await request.json();

    const { role, customerType, founderDiscount } = body;

    // Validate role
    if (!["CUSTOMER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    // Validate customer type
    if (!["NORMAL", "FOUNDER"].includes(customerType)) {
      return NextResponse.json(
        { error: "Invalid customer type." },
        { status: 400 },
      );
    }

    // Make sure user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Prevent an admin from removing their own admin access
    if (existingUser.id === session.user.id && role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "You cannot remove your own admin access.",
        },
        { status: 400 },
      );
    }

    // Validate founder discount
    let discount = null;

    if (customerType === "FOUNDER") {
      const numericDiscount = Number(founderDiscount);

      if (
        !Number.isFinite(numericDiscount) ||
        numericDiscount < 0 ||
        numericDiscount > 100
      ) {
        return NextResponse.json(
          {
            error: "Founder discount must be between 0 and 100.",
          },
          { status: 400 },
        );
      }

      discount = numericDiscount;
    }

    const user = await prisma.user.update({
      where: {
        id,
      },

      data: {
        role,
        customerType,
        founderDiscount: discount,
      },
    });

    return NextResponse.json({
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update user." },
      { status: 500 },
    );
  }
}
