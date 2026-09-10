import { signIn } from "@/auth";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function LoginPage() {
  return <main className="min-h-screen bg-espresso text-offwhite"><Navbar /><div className="flex min-h-[70vh] items-center justify-center px-5 py-16"><div className="w-full max-w-md rounded-3xl border border-bronze/30 bg-charcoal/50 p-8 text-center sm:p-10"><p className="text-xs uppercase tracking-[.25em] text-gold">Welcome to Niivora</p><h1 className="mt-4 font-playfair text-4xl">Sign in to continue.</h1><p className="mt-3 text-sm leading-6 text-warmgrey">Your account keeps your orders, founder benefits and Niivora Coins together.</p><form className="mt-8" action={async () => { "use server"; await signIn("google", { redirectTo: "/account" }); }}><button type="submit" className="w-full rounded-xl bg-gold px-6 py-4 text-sm font-semibold uppercase tracking-widest text-espresso transition hover:bg-bronze">Continue with Google</button></form><Link href="/products" className="mt-6 inline-block text-xs uppercase tracking-widest text-warmgrey hover:text-gold">Continue as guest →</Link></div></div><Footer /></main>;
}
