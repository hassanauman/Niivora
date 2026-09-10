import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/app/components/AddToCartButton";
import StoreNavbar from "@/app/components/StoreNavbar";
import Footer from "@/app/components/Footer";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, include: { variants: { orderBy: { createdAt: "asc" } } } });
  if (!product || !product.active || product.variants.length === 0) notFound();
  return <main className="min-h-screen bg-espresso text-offwhite"><StoreNavbar /><div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-16"><Link href="/products" className="text-xs uppercase tracking-widest text-gold">← Back to collection</Link><div className="mt-8 grid gap-10 md:grid-cols-2 lg:gap-16"><div className="aspect-square overflow-hidden rounded-3xl border border-bronze/30 bg-charcoal/50">{product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-sm text-warmgrey">No Image</div>}</div><div className="flex flex-col justify-center">{product.featured && <span className="text-xs uppercase tracking-[.2em] text-gold">Featured</span>}<h1 className="mt-3 font-playfair text-5xl sm:text-6xl">{product.name}</h1><div className="mt-7"><AddToCartButton product={{ id: product.id, name: product.name, slug: product.slug, image: product.image }} variants={product.variants.map(v => ({ id: v.id, name: v.name, price: Number(v.price), stock: v.stock, sku: v.sku }))}/></div>{product.description && <div className="mt-10 border-t border-bronze/30 pt-7"><p className="text-xs uppercase tracking-[.2em] text-gold">About this product</p><p className="mt-4 whitespace-pre-line text-sm leading-7 text-warmgrey">{product.description}</p></div>}<div className="mt-7 grid grid-cols-2 gap-3 text-xs uppercase tracking-widest"><div className="rounded-xl border border-bronze/30 p-4 text-warmgrey">Natural formula</div><div className="rounded-xl border border-bronze/30 p-4 text-warmgrey">Made in Pakistan</div></div></div></div></div><Footer /></main>;
}
