import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-bronze/30 bg-espresso px-6 py-14 text-offwhite sm:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div><p className="font-playfair text-3xl">Niivora</p><p className="mt-3 max-w-sm text-sm leading-6 text-warmgrey">Rooted in nature. Backed by science. Premium hair care made in Pakistan.</p></div>
        <div><p className="text-xs uppercase tracking-[.2em] text-gold">Explore</p><div className="mt-4 flex flex-col gap-3 text-sm text-offwhite/80"><Link href="/products">Shop</Link><Link href="/#our-story">Our Story</Link><Link href="/#ingredients">Ingredients</Link></div></div>
        <div><p className="text-xs uppercase tracking-[.2em] text-gold">Account</p><div className="mt-4 flex flex-col gap-3 text-sm text-offwhite/80"><Link href="/account">My Account</Link><Link href="/orders">My Orders</Link><Link href="/cart">Cart</Link></div></div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-bronze/30 pt-5 text-xs text-warmgrey">© {new Date().getFullYear()} Niivora. All rights reserved.</div>
    </footer>
  );
}
