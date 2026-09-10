import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const withdrawals = await prisma.withdrawal.findMany({ include: { user: { select: { name: true, email: true, founderCode: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ withdrawals: withdrawals.map(w => ({ ...w, amount: Number(w.amount) })) });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id, status, adminNote } = await request.json();
  if (!id || !["COMPLETED", "REJECTED"].includes(status)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  try {
    const result = await prisma.$transaction(async tx => {
      const withdrawal = await tx.withdrawal.findUnique({ where: { id } });
      if (!withdrawal) throw new Error("Withdrawal not found.");
      if (withdrawal.status !== "PENDING") throw new Error("This withdrawal has already been processed.");
      if (status === "REJECTED") {
        await tx.coinTransaction.create({ data: { userId: withdrawal.userId, amount: withdrawal.amount, type: "WITHDRAWAL_REFUND", description: `Refund for rejected withdrawal ${withdrawal.id}`, withdrawalId: withdrawal.id } });
      }
      return tx.withdrawal.update({ where: { id }, data: { status, adminNote: typeof adminNote === "string" ? adminNote.trim() || null : null, completedAt: new Date() } });
    });
    return NextResponse.json({ message: `Withdrawal ${status.toLowerCase()}.`, withdrawal: { ...result, amount: Number(result.amount) } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to process withdrawal." }, { status: 400 }); }
}
