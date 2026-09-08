"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: string; role: "CUSTOMER" | "ADMIN"; customerType: "NORMAL" | "FOUNDER"; founderDiscount: string | null; founderCode?: string | null; affiliateCommission?: string | null };

export default function UserForm({ user }: { user: User }) {
  const router = useRouter();
  const [role, setRole] = useState(user.role);
  const [customerType, setCustomerType] = useState(user.customerType);
  const [founderDiscount, setFounderDiscount] = useState(user.founderDiscount?.toString() ?? "");
  const [founderCode, setFounderCode] = useState(user.founderCode ?? "");
  const [affiliateCommission, setAffiliateCommission] = useState(user.affiliateCommission?.toString() ?? "10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role, customerType, founderDiscount, founderCode, affiliateCommission }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong.");
      router.push("/admin/users"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Something went wrong."); }
    finally { setLoading(false); }
  }

  return <form onSubmit={handleSubmit} className="space-y-6">
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}
    <div><label className="mb-2 block text-sm font-medium">Role</label><select value={role} onChange={(e) => setRole(e.target.value as "CUSTOMER" | "ADMIN")} className="w-full rounded-lg border px-4 py-3 outline-none"><option value="CUSTOMER">Customer</option><option value="ADMIN">Admin</option></select></div>
    <div><label className="mb-2 block text-sm font-medium">Customer Type</label><select value={customerType} onChange={(e) => setCustomerType(e.target.value as "NORMAL" | "FOUNDER")} className="w-full rounded-lg border px-4 py-3 outline-none"><option value="NORMAL">Normal Customer</option><option value="FOUNDER">Founder</option></select></div>
    {customerType === "FOUNDER" && <>
      <div><label className="mb-2 block text-sm font-medium">Founder Code</label><input value={founderCode} onChange={(e) => setFounderCode(e.target.value.toUpperCase())} placeholder="e.g. NIVO-HASSAN" maxLength={32} className="w-full rounded-lg border px-4 py-3 uppercase outline-none"/><p className="mt-2 text-sm text-gray-500">Give this unique code to the founder for affiliate sharing.</p></div>
      <div><label className="mb-2 block text-sm font-medium">Affiliate Commission (%)</label><input type="number" min="0" max="100" step="0.01" value={affiliateCommission} onChange={(e) => setAffiliateCommission(e.target.value)} className="w-full rounded-lg border px-4 py-3 outline-none"/><p className="mt-2 text-sm text-gray-500">Credited in Niivora Coins after a referred order is delivered.</p></div>
      <div><label className="mb-2 block text-sm font-medium">Founder Discount (%)</label><input type="number" min="0" max="100" step="0.01" value={founderDiscount} onChange={(e) => setFounderDiscount(e.target.value)} placeholder="e.g. 15" className="w-full rounded-lg border px-4 py-3 outline-none"/></div>
    </>}
    <div className="flex gap-4"><button type="button" onClick={() => router.push("/admin/users")} className="rounded-lg border px-5 py-3">Cancel</button><button type="submit" disabled={loading} className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50">{loading ? "Saving..." : "Save Changes"}</button></div>
  </form>;
}
