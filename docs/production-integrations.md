# Production integrations

## Resend order emails

Set these in Vercel → Project → Settings → Environment Variables (Production and Preview as appropriate):

- `RESEND_API_KEY`: API key from Resend.
- `RESEND_FROM_EMAIL`: sender address on a domain verified in Resend, for example `orders@your-verified-domain.com`.
- `NEXT_PUBLIC_SITE_URL`: canonical public site URL, e.g. `https://niivora.vercel.app`.

The currently supplied `niivora.official@gmail.com` is a contact address, not a sender domain that can be assumed verified in Resend. Resend generally requires a verified sending domain for production delivery. Do not put the API key in client-side or public variables.

If the Resend variables are not configured, orders still place normally and the API logs that the confirmation email was skipped. Email failures do not roll back a placed order.

## Meta Pixel

Set `NEXT_PUBLIC_META_PIXEL_ID` in Vercel when the Pixel/Dataset has been created in Meta Events Manager. Leave it unset until then. The Pixel is disabled when no ID is configured.

## Manual Easypaisa

Manual transfers are not automatically verified. Customers should transfer the displayed order total and send a screenshot with the order number to WhatsApp 03219977549. Admin must verify the transaction before marking payment as PAID. The Easypaisa account is configured in the checkout/order instructions.
