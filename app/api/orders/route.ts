import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type OrderItemInput = { id: string; variantId: string; quantity: number };
type OrderRequestBody = { items: OrderItemInput[]; customerName: string; customerEmail: string; shippingAddress: string; shippingCity: string; shippingPostalCode?: string; paymentMethod?: string };

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "You must be logged in to place an order." }, { status: 401 });
    const body = (await request.json()) as OrderRequestBody;
    const items = Array.isArray(body.items) ? body.items : [];
    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";
    const shippingAddress = typeof body.shippingAddress === "string" ? body.shippingAddress.trim() : "";
    const shippingCity = typeof body.shippingCity === "string" ? body.shippingCity.trim() : "";
    const shippingPostalCode = typeof body.shippingPostalCode === "string" ? body.shippingPostalCode.trim() : "";
    const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod.trim() : "";
    if (!items.length) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    if (!customerName || !customerEmail || !shippingAddress || !shippingCity) return NextResponse.json({ error: "Please complete all required customer and shipping fields." }, { status: 400 });
    if (!["COD", "COINS"].includes(paymentMethod)) return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
    for (const item of items) if (typeof item.id !== "string" || typeof item.variantId !== "string" || !item.variantId || !Number.isInteger(item.quantity) || item.quantity <= 0) return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { customerType: true, founderDiscount: true } });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (paymentMethod === "COINS" && user.customerType !== "FOUNDER") return NextResponse.json({ error: "Niivora Coins are available to founders only." }, { status: 403 });

    const productIds = items.map(i => i.id);
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, active: true }, include: { variants: true } });
    if (products.length !== new Set(productIds).size) return NextResponse.json({ error: "One or more products are unavailable." }, { status: 400 });
    const productMap = new Map(products.map(p => [p.id, p]));
    const referralCode = (await cookies()).get("niivora_referral")?.value?.trim().toUpperCase();
    const referredFounder = referralCode ? await prisma.user.findFirst({ where: { founderCode: referralCode, customerType: "FOUNDER" }, select: { id: true, founderCode: true, founderDiscount: true, affiliateCommission: true } }) : null;
    if (referredFounder?.id === session.user.id) return NextResponse.json({ error: "You cannot use your own founder referral code." }, { status: 400 });

    const result = await prisma.$transaction(async tx => {
      let subtotal = 0;
      const orderItems = items.map(item => {
        const product = productMap.get(item.id); if (!product) throw new Error("Product not found.");
        const variant = product.variants.find(v => v.id === item.variantId); if (!variant) throw new Error(`Invalid variant selected for ${product.name}.`);
        if (variant.stock < item.quantity) throw new Error(`Not enough stock available for ${product.name} - ${variant.name}.`);
        subtotal += Number(variant.price) * item.quantity;
        return { productId: product.id, variantId: variant.id, variantName: variant.name, productName: product.name, productSlug: product.slug, price: variant.price, quantity: item.quantity };
      });

      // A referral code belongs to a founder, so the founder's configured discount
      // applies to the customer using that code. Without a referral, founders get
      // their own normal founder discount.
      const discountPercentage = referredFounder
        ? Number(referredFounder.founderDiscount ?? 0)
        : user.customerType === "FOUNDER" && user.founderDiscount
          ? Number(user.founderDiscount)
          : 0;
      const discount = subtotal * (discountPercentage / 100);
      const total = Math.max(0, subtotal - discount);
      if (paymentMethod === "COINS") {
        const balance = await tx.coinTransaction.aggregate({ where: { userId: session.user.id }, _sum: { amount: true } });
        if (Number(balance._sum.amount ?? 0) < total) throw new Error("Insufficient Niivora Coins.");
      }
      const createdOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          status: "PENDING",
          paymentStatus: paymentMethod === "COINS" ? "PAID" : "PENDING",
          subtotal: subtotal.toFixed(2),
          shippingCost: "0.00",
          discount: discount.toFixed(2),
          total: total.toFixed(2),
          customerName,
          customerEmail,
          shippingAddress,
          shippingCity,
          shippingPostalCode: shippingPostalCode || null,
          paymentMethod,
          founderCodeUsed: referredFounder?.founderCode ?? null,
          referredFounderId: referredFounder?.id ?? null,
          affiliateCommission: null,
          items: { create: orderItems },
        },
        include: { items: true },
      });
      for (const item of items) await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } });
      if (paymentMethod === "COINS" && total > 0) await tx.coinTransaction.create({ data: { userId: session.user.id, amount: (-total).toFixed(2), type: "PURCHASE", description: `Purchase using Niivora Coins for order ${createdOrder.id}`, orderId: createdOrder.id } });
      return createdOrder;
    }, { isolationLevel: "Serializable" });
    return NextResponse.json({ message: "Order created successfully.", orderId: result.id }, { status: 201 });
  } catch (error) {
    console.error("ORDER CREATION ERROR:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong while creating the order." }, { status: 500 });
  }
}
