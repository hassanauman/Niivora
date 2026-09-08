import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const PAKISTANI_BANKS = [
  "HBL", "UBL", "MCB Bank", "Allied Bank", "Meezan Bank", "Bank Alfalah", "Bank Al Habib",
  "Faysal Bank", "Askari Bank", "Standard Chartered Pakistan", "JS Bank", "Soneri Bank",
  "Habib Metropolitan Bank", "Dubai Islamic Bank Pakistan", "BankIslami", "National Bank of Pakistan",
  "The Bank of Punjab", "The Bank of Khyber", "Sindh Bank", "Silkbank", "First Women Bank",
];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const amount = Number(body.amount);
  const bankName = typeof body.bankName === "string" ? body.bankName.trim() : "";
  const accountNumber = typeof body.accountNumber === "string" ? body.accountNumber.trim() : "";

  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Enter a valid withdrawal amount." }, { status: 400 });
  if (!PAKISTANI_BANKS.includes(bankName)) return NextResponse.json({ error: "Please select a valid Pakistani bank." }, { status: 400 });
  if (!/^[0-9]{8,24}$/.test(accountNumber)) return NextResponse.json({ error: "Enter a valid bank account number." }, { status: 400 });

  try {
    const withdrawal = await prisma.$transaction(async (tx) => {
      const balance = await tx.coinTransaction.aggregate({ where: { userId: session.user.id }, _sum: { amount: true } });
      const available = Number(balance._sum.amount ?? 0);
      if (amount > available) throw new Error("Insufficient Niivora Coins.");

      const pending = await tx.withdrawal.findFirst({ where: { userId: session.user.id, status: "PENDING" } });
      if (pending) throw new Error("You already have a pending withdrawal request.");

      const created = await tx.withdrawal.create({ data: { userId: session.user.id, amount: amount.toFixed(2), bankName, accountNumber } });
      await tx.coinTransaction.create({
        data: { userId: session.user.id, amount: (-amount).toFixed(2), type: "WITHDRAWAL", description: `Withdrawal request to ${bankName}`, withdrawalId: created.id },
      });
      return created;
    });

    return NextResponse.json({ message: "Withdrawal request submitted.", withdrawal: { ...withdrawal, amount: Number(withdrawal.amount) } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create withdrawal." }, { status: 400 });
  }
}
