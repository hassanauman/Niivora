import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getFounderBalance } from "@/lib/founder";
import WithdrawalForm from "@/components/founder/WithdrawalForm";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, image: true, customerType: true, founderCode: true, affiliateCommission: true } });
  if (!user) redirect("/");

  const balance = user.customerType === "FOUNDER" ? await getFounderBalance(session.user.id) : 0;
  const transactions = user.customerType === "FOUNDER" ? await prisma.coinTransaction.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 10 }) : [];
  const referrals = user.customerType === "FOUNDER" ? await prisma.order.count({ where: { referredFounderId: session.user.id } }) : 0;

  return <main className="min-h-screen bg-[#1a1512] px-5 py-12 text-[#f5f1ea] sm:px-8"><div className="mx-auto max-w-6xl">
    <div className="flex flex-col gap-4 border-b border-[#3a3027] pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm uppercase tracking-[0.25em] text-[#c6a15b]">My Account</p><h1 className="mt-2 font-playfair text-5xl">Welcome, {user.name?.split(" ")[0] ?? "there"}.</h1></div><Link href="/orders" className="text-sm text-[#c6a15b]">View my orders →</Link></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-[#3a3027] bg-[#211b17] p-6"><p className="text-sm text-[#9c8f7c]">Account type</p><p className="mt-2 text-xl">{user.customerType === "FOUNDER" ? "Founder" : "Customer"}</p></div><div className="rounded-2xl border border-[#3a3027] bg-[#211b17] p-6"><p className="text-sm text-[#9c8f7c]">Niivora Coins</p><p className="mt-2 text-3xl font-medium">{balance.toFixed(2)}</p><p className="text-sm text-[#9c8f7c]">1 coin = PKR 1</p></div><div className="rounded-2xl border border-[#3a3027] bg-[#211b17] p-6"><p className="text-sm text-[#9c8f7c]">Referrals</p><p className="mt-2 text-3xl font-medium">{referrals}</p></div></div>
    {user.customerType === "FOUNDER" ? <div className="mt-6 grid gap-6 lg:grid-cols-5"><section className="rounded-2xl border border-[#3a3027] bg-[#211b17] p-6 lg:col-span-2"><p className="text-sm uppercase tracking-[0.2em] text-[#c6a15b]">Founder code</p><h2 className="mt-3 font-playfair text-3xl">{user.founderCode}</h2><p className="mt-3 text-sm leading-6 text-[#9c8f7c]">Share your code through your affiliate link. You earn {Number(user.affiliateCommission)}% in Niivora Coins when a referred order is delivered.</p><div className="mt-5 rounded-xl border border-[#3a3027] bg-[#1a1512] p-4 text-sm break-all text-[#c6a15b]">{`/r/${user.founderCode}`}</div><p className="mt-3 text-xs text-[#9c8f7c]">Add your domain before sharing this link.</p><WithdrawalForm balance={balance}/></section><section className="rounded-2xl border border-[#3a3027] bg-[#211b17] p-6 lg:col-span-3"><div className="flex items-center justify-between"><div><p className="text-sm uppercase tracking-[0.2em] text-[#c6a15b]">Wallet</p><h2 className="mt-2 font-playfair text-3xl">Recent activity</h2></div></div><div className="mt-6 divide-y divide-[#3a3027]">{transactions.length ? transactions.map((t) => <div key={t.id} className="flex items-center justify-between py-4"><div><p className="font-medium">{t.description ?? t.type.replaceAll("_", " ")}</p><p className="text-xs text-[#9c8f7c]">{t.createdAt.toLocaleDateString()}</p></div><span className={Number(t.amount) >= 0 ? "text-[#c6a15b]" : "text-[#9c8f7c]"}>{Number(t.amount) >= 0 ? "+" : ""}{Number(t.amount).toFixed(2)} NC</span></div>) : <p className="py-8 text-[#9c8f7c]">No wallet activity yet.</p>}</div></section></div> : <div className="mt-6 rounded-2xl border border-[#3a3027] bg-[#211b17] p-6"><h2 className="font-playfair text-3xl">Account details</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><p><span className="text-[#9c8f7c]">Name</span><br/>{user.name ?? "—"}</p><p><span className="text-[#9c8f7c]">Email</span><br/>{user.email ?? "—"}</p></div></div>}
  </div></main>;
}
