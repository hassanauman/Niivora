type OrderEmailItem = { name: string; variant: string | null; quantity: number; price: number };

export async function sendOrderConfirmation(input: {
  to: string;
  customerName: string;
  orderNumber: string;
  orderId: string;
  total: number;
  paymentMethod: string;
  items: OrderEmailItem[];
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("Order confirmation email skipped: configure RESEND_API_KEY and RESEND_FROM_EMAIL.");
    return false;
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://niivora.vercel.app")).replace(/\/$/, "");
  const trackingUrl = `${siteUrl}/orders/${encodeURIComponent(input.orderId)}`;
  const money = (amount: number) => `PKR ${amount.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const itemsHtml = input.items.map(item => `<tr><td style="padding:12px 0;border-bottom:1px solid #e8dfd2">${escapeHtml(item.name)}<br><span style="color:#887d70;font-size:12px">${escapeHtml(item.variant || "Standard")} · Qty ${item.quantity}</span></td><td style="padding:12px 0;border-bottom:1px solid #e8dfd2;text-align:right;white-space:nowrap">${money(item.price * item.quantity)}</td></tr>`).join("");
  const isEasypaisa = input.paymentMethod === "EASYPAISA";
  const paymentLabel = isEasypaisa ? "Manual Easypaisa transfer" : input.paymentMethod === "COINS" ? "Niivora Coins" : "Cash on Delivery";
  const paymentInstructions = isEasypaisa ? `<div style="margin-top:24px;padding:20px;background:#f8f1e5;border:1px solid #d6bd8b;border-radius:12px"><h2 style="margin:0 0 12px;color:#6e5126;font-size:18px">Complete your payment</h2><p style="margin:6px 0">Easypaisa account: <strong>03219977549</strong></p><p style="margin:6px 0">Account name: <strong>Muhammad Hassan Nauman</strong></p><p style="margin:12px 0 0">After transferring ${money(input.total)}, send a screenshot of the transaction to WhatsApp <strong>03219977549</strong> and include order number <strong>${input.orderNumber}</strong>.</p></div>` : "";
  const html = `<!doctype html><html><body style="margin:0;background:#f5f1ea;font-family:Arial,sans-serif;color:#1a1512"><div style="max-width:620px;margin:28px auto;padding:28px;background:#fffdf9;border:1px solid #e6dccd;border-radius:16px"><p style="color:#a9803f;letter-spacing:3px;font-size:12px">NIIVORA · ORDER CONFIRMATION</p><h1 style="font-family:Georgia,serif;font-weight:normal;font-size:32px">Thank you, ${escapeHtml(input.customerName)}.</h1><p>Your order has been received. Keep this order number for payment and tracking.</p><div style="padding:14px;background:#f5f1ea;border-radius:10px"><span style="color:#887d70;font-size:12px">ORDER NUMBER</span><div style="font-size:22px;font-weight:bold;margin-top:5px">${input.orderNumber}</div></div><table style="width:100%;border-collapse:collapse;margin-top:20px"><tbody>${itemsHtml}</tbody></table><div style="display:flex;justify-content:space-between;padding-top:18px;font-size:18px"><strong>Total</strong><strong>${money(input.total)}</strong></div><p style="color:#887d70;font-size:13px">Payment method: ${paymentLabel}</p>${paymentInstructions}<p style="margin:28px 0"><a href="${trackingUrl}" style="display:inline-block;background:#c6a15b;color:#1a1512;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:bold">Track your order</a></p><p style="font-size:12px;color:#887d70">Niivora · Thoughtfully made, intentionally yours.</p></div></body></html>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to: [input.to], subject: `Niivora order confirmed — ${input.orderNumber}`,
      html,
      text: `Thank you, ${input.customerName}. Order ${input.orderNumber}. Total: ${money(input.total)}. Payment: ${paymentLabel}. ${isEasypaisa ? "Transfer to Easypaisa 03219977549, account name Muhammad Hassan Nauman. Send the transaction screenshot to WhatsApp 03219977549 with order number " + input.orderNumber + ". " : ""}Track your order: ${trackingUrl}`,
    }),
  });
  if (!response.ok) {
    console.error("Resend rejected order email:", response.status, await response.text());
    return false;
  }
  return true;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}
