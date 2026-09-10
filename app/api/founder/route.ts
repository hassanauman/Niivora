import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getFounderBalance } from "@/lib/founder";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, customerType: true, founderCode: true, affiliateCommission: true },
  });
  if (!user || user.customerType !== "FOUNDER") return NextResponse.json({ error: "Founder access required." }, { status: 403 });

  const [balance, earnings, referrals, transactions, withdrawals] = await Promise.all([
    getFounderBalance(user.id),
    prisma.coinTransaction.aggregate({ where: { userId: user.id, type: "AFFILIATE_EARNING" }, _sum: { amount: true } }),
    prisma.order.count({ where: { referredFounderId: user.id } }),
    prisma.coinTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.withdrawal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return NextResponse.json({
    user: { ...user, affiliateCommission: Number(user.affiliateCommission) },
    balance,
    totalEarnings: Number(earnings._sum.amount ?? 0),
    referrals,
    transactions: transactions.map((t) => ({ ...t, amount: Number(t.amount) })),
    withdrawals: withdrawals.map((w) => ({ ...w, amount: Number(w.amount) })),
  });
}
