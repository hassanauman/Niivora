"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag, Check, X } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import Navbar from "@/app/components/Navbar";

type UserData = { name: string | null; email: string | null; customerType: "NORMAL" | "FOUNDER"; founderDiscount: string | null; coinBalance: number };
type Referral = { active: boolean; code?: string; discountPercentage?: number; affiliateCommission?: number };

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [user, setUser] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [address, setAddress] = useState(""); const [city, setCity] = useState(""); const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [code, setCode] = useState(""); const [referral, setReferral] = useState<Referral>({ active: false }); const [codeLoading, setCodeLoading] = useState(false);
  const [error, setError] = useState(""); const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [userResponse, referralResponse] = await Promise.all([fetch("/api/checkout/user"), fetch("/api/checkout/referral")]);
        if (!userResponse.ok) { window.location.href = "/login?callbackUrl=/checkout"; return; }
        const data = await userResponse.json(); setUser(data.user); setName(data.user.name ?? ""); setEmail(data.user.email ?? "");
        const referralData = await referralResponse.json(); setReferral(referralData); if (referralData.active) setCode(referralData.code ?? "");
      } catch { setError("Unable to load your checkout information."); } finally { setLoadingUser(false); }
    }
    load();
  }, []);

  const ownDiscount = user?.customerType === "FOUNDER" ? Number(user.founderDiscount ?? 0) : 0;
  const discountPercentage = referral.active ? Number(referral.discountPercentage ?? 0) : ownDiscount;
  const discount = subtotal * (discountPercentage / 100);
  const total = Math.max(0, subtotal - discount);

  async function applyCode() {
    if (!code.trim()) return;
    setCodeLoading(true); setError("");
    try {
      const response = await fetch("/api/checkout/referral", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Invalid founder code."); return; }
      setReferral(data); setCode(data.code);
    } catch { setError("Unable to validate that code."); } finally { setCodeLoading(false); }
  }

  async function removeCode() {
    await fetch("/api/checkout/referral", { method: "DELETE" });
    setReferral({ active: false }); setCode(""); setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!name.trim() || !email.trim() || !address.trim() || !city.trim()) { setError("Please complete all required fields."); return; }
    if (paymentMethod === "COINS" && (user?.coinBalance ?? 0) < total) { setError("You do not have enough Niivora Coins for this order."); return; }
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map(i => ({ id: i.id, variantId: i.variantId, quantity: i.quantity })), customerName: name, customerEmail: email, shippingAddress: address, shippingCity: city, shippingPostalCode: postalCode, paymentMethod }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Failed to create your order."); return; }
      clearCart(); window.location.href = `/orders/${data.orderId}`;
    } catch { setError("Something went wrong. Please try again."); } finally { setSubmitting(false); }
  }

  if (items.length === 0) return <main className="min-h-screen bg-espresso text-offwhite"><Navbar isAuthenticated={!!user} isFounder={user?.customerType === "FOUNDER"} /><div className="mx-auto max-w-3xl px-5 py-24 text-center"><p className="text-xs uppercase tracking-[.25em] text-gold">Checkout</p><h1 className="mt-4 font-playfair text-5xl">Your cart is empty.</h1><Link href="/products" className="mt-8 inline-block border border-gold px-7 py-3 text-xs uppercase tracking-widest text-gold">Continue Shopping</Link></div></main>;
  if (loadingUser) return <main className="min-h-screen bg-espresso text-offwhite"><Navbar /><div className="flex min-h-[70vh] items-center justify-center text-warmgrey">Loading checkout...</div></main>;

  return <main className="min-h-screen bg-espresso text-offwhite"><Navbar isAuthenticated isFounder={user?.customerType === "FOUNDER"} /><div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
    <div className="mb-10"><p className="text-xs uppercase tracking-[.25em] text-gold">Niivora / Checkout</p><h1 className="mt-3 font-playfair text-5xl sm:text-6xl">Complete your order.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-warmgrey">Secure your essentials, apply a founder code if you have one, and choose your payment method.</p></div>
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="rounded-2xl border border-bronze/30 bg-charcoal/50 p-6 sm:p-8"><p className="text-xs uppercase tracking-[.2em] text-gold">01</p><h2 className="mt-2 font-playfair text-3xl">Your details</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="rounded-xl border border-bronze/30 bg-espresso px-4 py-3.5 text-sm outline-none transition focus:border-gold" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="rounded-xl border border-bronze/30 bg-espresso px-4 py-3.5 text-sm outline-none transition focus:border-gold" /></div></section>
        <section className="rounded-2xl border border-bronze/30 bg-charcoal/50 p-6 sm:p-8"><p className="text-xs uppercase tracking-[.2em] text-gold">02</p><h2 className="mt-2 font-playfair text-3xl">Delivery</h2><div className="mt-6 space-y-4"><textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} placeholder="Street address" className="w-full resize-none rounded-xl border border-bronze/30 bg-espresso px-4 py-3.5 text-sm outline-none focus:border-gold" /><div className="grid gap-4 sm:grid-cols-2"><input value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="rounded-xl border border-bronze/30 bg-espresso px-4 py-3.5 text-sm outline-none focus:border-gold" /><input value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="Postal code" className="rounded-xl border border-bronze/30 bg-espresso px-4 py-3.5 text-sm outline-none focus:border-gold" /></div></div></section>
        <section className="rounded-2xl border border-bronze/30 bg-charcoal/50 p-6 sm:p-8"><p className="text-xs uppercase tracking-[.2em] text-gold">03</p><h2 className="mt-2 font-playfair text-3xl">Founder code</h2><p className="mt-2 text-sm text-warmgrey">Have a founder's referral code? Enter it here. Each founder can have a different customer discount.</p><div className="mt-6 flex gap-3"><div className="relative flex-1"><Tag size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-warmgrey" /><input value={code} onChange={e => setCode(e.target.value.toUpperCase())} disabled={referral.active} placeholder="NIVO-XXXXXX" className="w-full rounded-xl border border-bronze/30 bg-espresso py-3.5 pl-11 pr-4 text-sm uppercase tracking-wider outline-none focus:border-gold disabled:opacity-70" /></div>{referral.active ? <button type="button" onClick={removeCode} className="rounded-xl border border-bronze/50 px-5 text-xs uppercase tracking-widest text-warmgrey transition hover:border-gold hover:text-gold"><X size={15} className="mx-auto" /></button> : <button type="button" onClick={applyCode} disabled={codeLoading} className="rounded-xl bg-gold px-6 text-xs font-semibold uppercase tracking-widest text-espresso disabled:opacity-50">{codeLoading ? "..." : "Apply"}</button>}</div>{referral.active && <div className="mt-4 flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold"><Check size={17} /> Code {referral.code} applied — {Number(referral.discountPercentage ?? 0)}% customer discount.</div>}</section>
        <section className="rounded-2xl border border-bronze/30 bg-charcoal/50 p-6 sm:p-8"><p className="text-xs uppercase tracking-[.2em] text-gold">04</p><h2 className="mt-2 font-playfair text-3xl">Payment</h2><div className="mt-6 space-y-3"><label className={`block cursor-pointer rounded-xl border p-4 transition ${paymentMethod === "COD" ? "border-gold bg-gold/5" : "border-bronze/30"}`}><input type="radio" name="payment" value="COD" checked={paymentMethod === "COD"} onChange={e => setPaymentMethod(e.target.value)} className="mr-3 accent-[#c6a15b]" />Cash on Delivery</label>{user?.customerType === "FOUNDER" && <label className={`block cursor-pointer rounded-xl border p-4 transition ${paymentMethod === "COINS" ? "border-gold bg-gold/5" : "border-bronze/30"}`}><input type="radio" name="payment" value="COINS" checked={paymentMethod === "COINS"} onChange={e => setPaymentMethod(e.target.value)} className="mr-3 accent-[#c6a15b]" />Niivora Coins <span className="ml-2 text-sm text-gold">({user.coinBalance.toFixed(2)} available)</span></label>}</div></section>
        {error && <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">{error}</div>}
        <button disabled={submitting} className="w-full rounded-xl bg-gold px-6 py-4 text-sm font-semibold uppercase tracking-[.15em] text-espresso transition hover:bg-bronze disabled:opacity-50">{submitting ? "Placing Order..." : `Place Order · PKR ${total.toFixed(2)}`}</button>
      </form>
      <aside className="h-fit rounded-2xl border border-bronze/30 bg-charcoal/50 p-6 lg:sticky lg:top-28"><p className="text-xs uppercase tracking-[.2em] text-gold">Order Summary</p><div className="mt-6 space-y-5">{items.map(i => <div key={i.variantId} className="flex justify-between gap-4"><div><p className="text-sm">{i.name}</p><p className="mt-1 text-xs text-warmgrey">{i.variantName} · Qty {i.quantity}</p></div><p className="text-sm">PKR {(i.price * i.quantity).toFixed(2)}</p></div>)}</div><div className="mt-6 space-y-3 border-t border-bronze/30 pt-5 text-sm"><div className="flex justify-between text-warmgrey"><span>Subtotal</span><span>PKR {subtotal.toFixed(2)}</span></div>{discount > 0 && <div className="flex justify-between text-gold"><span>{referral.active ? `Founder code (${referral.code})` : "Founder discount"}</span><span>-PKR {discount.toFixed(2)}</span></div>}<div className="flex justify-between border-t border-bronze/30 pt-4 text-xl"><span>Total</span><span>PKR {total.toFixed(2)}</span></div></div><p className="mt-5 text-xs leading-5 text-warmgrey">Shipping is currently free. Your final discount is calculated again on the server when the order is placed.</p></aside>
    </div>
  </div></main>;
}
