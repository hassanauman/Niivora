"use client";

import Link from "next/link";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";

export default function StoreNavbar() {
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const links = [
    ["Home", "/"],
    ["Our Story", "/#our-story"],
    ["Shop", "/products"],
    ["Ingredients", "/#ingredients"],
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-bronze/30 bg-espresso/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
        <button onClick={() => setOpen(true)} className="text-offwhite lg:hidden" aria-label="Open menu"><Menu size={22} /></button>
        <Link href="/" className="font-playfair text-2xl tracking-wide text-offwhite">Niivora</Link>
        <nav className="hidden items-center gap-9 lg:flex">
          {links.map(([label, href]) => <Link key={href} href={href} className="font-jost text-xs uppercase tracking-[.16em] text-offwhite/80 transition hover:text-gold">{label}</Link>)}
        </nav>
        <div className="flex items-center gap-5">
          <Link href="/account" aria-label="Account" className="text-offwhite transition hover:text-gold"><UserRound size={19} /></Link>
          <Link href="/cart" aria-label="Cart" className="relative text-offwhite transition hover:text-gold"><ShoppingBag size={19} />{count > 0 && <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-espresso">{count}</span>}</Link>
        </div>
      </div>
      {open && <div className="fixed inset-0 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-espresso p-7 shadow-2xl transition-transform lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between"><span className="font-playfair text-2xl text-offwhite">Niivora</span><button onClick={() => setOpen(false)} className="text-offwhite"><X size={22} /></button></div>
        <nav className="mt-12 flex flex-col gap-6">{links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="border-b border-bronze/30 pb-4 font-jost text-sm uppercase tracking-[.15em] text-offwhite">{label}</Link>)}<Link href="/orders" onClick={() => setOpen(false)} className="border-b border-bronze/30 pb-4 font-jost text-sm uppercase tracking-[.15em] text-offwhite">My Orders</Link><Link href="/account" onClick={() => setOpen(false)} className="font-jost text-sm uppercase tracking-[.15em] text-gold">My Account</Link></nav>
      </aside>
    </header>
  );
}
