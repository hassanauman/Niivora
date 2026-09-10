import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    const { role, customerType, founderDiscount, founderCode, affiliateCommission } = body;
    if (!["CUSTOMER", "ADMIN"].includes(role)) return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    if (!["NORMAL", "FOUNDER"].includes(customerType)) return NextResponse.json({ error: "Invalid customer type." }, { status: 400 });

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (existingUser.id === session.user.id && role !== "ADMIN") return NextResponse.json({ error: "You cannot remove your own admin access." }, { status: 400 });

    let discount = null;
    let code: string | null = null;
    let commission = 10;
    if (customerType === "FOUNDER") {
      const numericDiscount = Number(founderDiscount);
      if (!Number.isFinite(numericDiscount) || numericDiscount < 0 || numericDiscount > 100) return NextResponse.json({ error: "Founder discount must be between 0 and 100." }, { status: 400 });
      discount = numericDiscount;
      code = typeof founderCode === "string" ? founderCode.trim().toUpperCase() : "";
      if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(code)) return NextResponse.json({ error: "Founder code must be 3-32 characters using letters, numbers, - or _." }, { status: 400 });
      commission = Number(affiliateCommission);
      if (!Number.isFinite(commission) || commission < 0 || commission > 100) return NextResponse.json({ error: "Affiliate commission must be between 0 and 100." }, { status: 400 });
      const duplicate = await prisma.user.findFirst({ where: { founderCode: code, NOT: { id } }, select: { id: true } });
      if (duplicate) return NextResponse.json({ error: "That founder code is already in use." }, { status: 409 });
    }

    const user = await prisma.user.update({ where: { id }, data: { role, customerType, founderDiscount: discount, founderCode: code, affiliateCommission: commission } });
    return NextResponse.json({ message: "User updated successfully.", user: { ...user, founderDiscount: user.founderDiscount?.toString() ?? null, affiliateCommission: user.affiliateCommission.toString() } });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}
