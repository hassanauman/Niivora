import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import UserForm from "@/components/admin/UserForm";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  return <main className="min-h-screen bg-[#1a1512] px-5 py-10 text-[#f5f1ea] sm:px-8"><div className="mx-auto max-w-2xl">
    <h1 className="font-playfair text-4xl">Edit Customer</h1><p className="mt-2 text-[#9c8f7c]">Manage account, founder and affiliate settings.</p>
    <div className="mt-8 rounded-2xl border border-[#3a3027] bg-[#211b17] p-6">
      <div className="mb-8 flex items-center gap-4">{user.image ? <img src={user.image} alt={user.name ?? "User"} className="h-16 w-16 rounded-full"/> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3a3027] text-xl">{user.name?.charAt(0).toUpperCase() ?? "?"}</div>}<div><h2 className="font-medium">{user.name ?? "Unnamed User"}</h2><p className="text-sm text-[#9c8f7c]">{user.email ?? "No email"}</p></div></div>
      <UserForm user={{ ...user, founderDiscount: user.founderDiscount?.toString() ?? null, affiliateCommission: user.affiliateCommission.toString() }} />
    </div>
  </div></main>;
}
