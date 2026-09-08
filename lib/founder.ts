import { prisma } from "@/lib/prisma";

export async function getFounderBalance(userId: string) {
  const result = await prisma.coinTransaction.aggregate({
    where: { userId },
    _sum: { amount: true },
  });

  return Number(result._sum.amount ?? 0);
}

export function generateFounderCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "NIVO-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
