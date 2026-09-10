import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getFounderBalance } from "@/lib/founder";
import WithdrawalForm from "@/components/founder/WithdrawalForm";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, image: true, customerType: true, founderCode: true, affiliateCommission: true, founderDiscount: true } });
  if (!user) redirect("/");
  const balance = user.customerType === "FOUNDER" ? await getFounderBalance(session.user.id) : 0;
  const transactions = user.customerType === "FOUNDER" ? await prisma.coinTransaction.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 10 }) : [];
  const referrals = user.customerType === "FOUNDER" ? await prisma.order.count({ where: { referredFounderId: session.user.id } }) : 0;

  return <main className="min-h-screen bg-espresso text-offwhite"><Navbar isAuthenticated isAdmin={session.user.role === "ADMIN"} isFounder={session.user.customerType === "FOUNDER"} /><div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
    <div className="flex flex-col gap-5 border-b border-bronze/30 pb-10 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs uppercase tracking-[.25em] text-gold">My Account</p><h1 className="mt-3 font-playfair text-5xl">Welcome, {user.name?.split(" ")[0] ?? "there"}.</h1><p className="mt-3 text-sm text-warmgrey">Manage your profile, orders and founder benefits.</p></div><Link href="/orders" className="text-xs uppercase tracking-widest text-gold">View my orders →</Link></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-bronze/30 bg-charcoal/50 p-6"><p className="text-xs uppercase tracking-widest text-warmgrey">Account type</p><p className="mt-3 text-2xl font-playfair">{user.customerType === "FOUNDER" ? "Founder" : "Customer"}</p></div><div className="rounded-2xl border border-bronze/30 bg-charcoal/50 p-6"><p className="text-xs uppercase tracking-widest text-warmgrey">Niivora Coins</p><p className="mt-3 text-3xl">{balance.toFixed(2)}</p><p className="mt-1 text-xs text-warmgrey">1 coin = PKR 1</p></div><div className="rounded-2xl border border-bronze/30 bg-charcoal/50 p-6"><p className="text-xs uppercase tracking-widest text-warmgrey">Referrals</p><p className="mt-3 text-3xl">{referrals}</p></div></div>
    {user.customerType === "FOUNDER" ? <div id="founder" className="mt-6 grid gap-6 lg:grid-cols-5"><section className="rounded-2xl border border-gold/30 bg-charcoal/50 p-7 lg:col-span-2"><p className="text-xs uppercase tracking-[.2em] text-gold">Founder programme</p><h2 className="mt-3 font-playfair text-3xl">{user.founderCode}</h2><p className="mt-3 text-sm leading-6 text-warmgrey">Customers using your code receive {Number(user.founderDiscount ?? 0)}% off. You earn {Number(user.affiliateCommission)}% in Niivora Coins when a referred order is delivered.</p><div className="mt-5 rounded-xl border border-bronze/30 bg-espresso p-4 font-mono text-sm text-gold">/r/{user.founderCode}</div><WithdrawalForm balance={balance}/></section><section className="rounded-2xl border border-bronze/30 bg-charcoal/50 p-7 lg:col-span-3"><p className="text-xs uppercase tracking-[.2em] text-gold">Wallet</p><h2 className="mt-2 font-playfair text-3xl">Recent activity</h2><div className="mt-6 divide-y divide-bronze/20">{transactions.length ? transactions.map(t => <div key={t.id} className="flex items-center justify-between gap-4 py-4"><div><p className="text-sm">{t.description ?? t.type.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-warmgrey">{t.createdAt.toLocaleDateString()}</p></div><span className={Number(t.amount) >= 0 ? "text-gold" : "text-warmgrey"}>{Number(t.amount) >= 0 ? "+" : ""}{Number(t.amount).toFixed(2)} NC</span></div>) : <p className="py-8 text-sm text-warmgrey">No wallet activity yet.</p>}</div></section></div> : <div className="mt-6 rounded-2xl border border-bronze/30 bg-charcoal/50 p-7"><p className="text-xs uppercase tracking-[.2em] text-gold">Profile</p><h2 className="mt-2 font-playfair text-3xl">Account details</h2><div className="mt-6 grid gap-6 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-widest text-warmgrey">Name</p><p className="mt-2">{user.name ?? "—"}</p></div><div><p className="text-xs uppercase tracking-widest text-warmgrey">Email</p><p className="mt-2">{user.email ?? "—"}</p></div></div></div>}
  </div><Footer /></main>;
}
