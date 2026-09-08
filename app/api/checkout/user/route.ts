import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, customerType: true, founderDiscount: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const balance = user.customerType === "FOUNDER" ? Number((await prisma.coinTransaction.aggregate({ where: { userId: session.user.id }, _sum: { amount: true } }))._sum.amount ?? 0) : 0;
    return NextResponse.json({ user: { ...user, founderDiscount: user.founderDiscount?.toString() ?? null, coinBalance: balance } });
  } catch (error) { console.error("CHECKOUT USER ERROR:", error); return NextResponse.json({ error: "Failed to load user" }, { status: 500 }); }
}
