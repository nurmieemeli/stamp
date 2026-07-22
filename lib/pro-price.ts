// Plain constants, safe to import from client components — kept separate
// from lib/stripe.ts, which instantiates the Node Stripe SDK against
// STRIPE_SECRET_KEY and must never end up in a client bundle.
export const PRO_PRICE_CENTS = 900;
export const PRO_PRICE_CURRENCY = "usd";
export const PRO_PRICE_LABEL = "$9";
