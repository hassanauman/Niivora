import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getReferral(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  return prisma.user.findFirst({ where: { founderCode: normalized, customerType: "FOUNDER" }, select: { id: true, founderCode: true, founderDiscount: true, affiliateCommission: true } });
}

export async function GET() {
  const code = (await cookies()).get("niivora_referral")?.value ?? "";
  const founder = await getReferral(code);
  if (!founder) return NextResponse.json({ active: false });
  return NextResponse.json({ active: true, code: founder.founderCode, discountPercentage: Number(founder.founderDiscount ?? 0), affiliateCommission: Number(founder.affiliateCommission) });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code : "";
    const founder = await getReferral(code);
    if (!founder) return NextResponse.json({ error: "That founder code is invalid or inactive." }, { status: 400 });
    if (session?.user?.id === founder.id) return NextResponse.json({ error: "You cannot use your own founder referral code." }, { status: 400 });
    const response = NextResponse.json({ active: true, code: founder.founderCode, discountPercentage: Number(founder.founderDiscount ?? 0), affiliateCommission: Number(founder.affiliateCommission) });
    response.cookies.set("niivora_referral", founder.founderCode!, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to apply that code." }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ active: false });
  response.cookies.set("niivora_referral", "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 0, path: "/" });
  return response;
}
