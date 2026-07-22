import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";

// The first "real" route handler in this app (everything else is a server
// action) — Stripe calls this over plain HTTP, so it needs raw-body access
// for signature verification, which a server action can't provide.
export async function POST(req: NextRequest) {
  if (!stripe) {
    console.error("stripe webhook: STRIPE_SECRET_KEY not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("stripe webhook: STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("stripe webhook: signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Stripe retries (and eventually disables the endpoint) on non-2xx —
  // explicitly no-op any event type/state we don't handle rather than
  // letting it fall through unhandled.
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // checkout.session.completed doesn't guarantee payment — delayed payment
  // methods can complete "unpaid", with confirmation arriving later via a
  // separate async_payment_succeeded event. Only cards are offered today,
  // but check explicitly rather than trusting the event name alone.
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("stripe webhook: checkout.session.completed with no metadata.userId", session.id);
    return NextResponse.json({ received: true });
  }

  const amountTotal = session.amount_total ?? 0;
  const currency = session.currency ?? "usd";
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : "";

  await db.$transaction(async (tx) => {
    // Unconditional and idempotent — safe to re-run on every delivery,
    // unlike the Purchase insert below. That ordering means a crash between
    // the two on a first delivery still self-heals on Stripe's retry
    // instead of leaving a logged purchase with no Pro grant.
    await tx.user.update({
      where: { id: userId },
      data: { isPro: true, proPurchasedAt: new Date() },
    });

    try {
      await tx.purchase.create({
        data: {
          userId,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          amountTotal,
          currency,
        },
      });
    } catch (err) {
      // Duplicate delivery of an event already recorded. Relies on SQLite
      // (via the better-sqlite3 adapter) not poisoning the rest of an
      // interactive transaction on an inner statement error the way
      // Postgres does — the User update above still commits.
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) {
        throw err;
      }
    }
  });

  return NextResponse.json({ received: true });
}
