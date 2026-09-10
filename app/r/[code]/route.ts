import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const normalizedCode = decodeURIComponent(code).trim().toUpperCase();
  const founder = await prisma.user.findFirst({ where: { founderCode: normalizedCode, customerType: "FOUNDER" }, select: { id: true } });
  const response = NextResponse.redirect(new URL("/products", request.url));
  if (founder) response.cookies.set("niivora_referral", normalizedCode, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
  return response;
}
