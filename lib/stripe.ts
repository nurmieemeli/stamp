import Stripe from "stripe";

// Purchase-initiated action, unlike Turnstile's passive bot check — a null
// client here must produce a clear error, not a silent no-op, so it mirrors
// lib/email.ts's degrade pattern rather than lib/turnstile.ts's.
export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
