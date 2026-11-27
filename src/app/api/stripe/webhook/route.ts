import { NextResponse } from "next/server";
import { markJoined } from "@/lib/live-store";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

/** Stripe calls this after a checkout. Endpoint: /api/stripe/webhook, event: checkout.session.completed. */
export async function POST(req: Request) {
  const s = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s || !secret) return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event;
  try {
    event = s.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid" || session.payment_status === "no_payment_required") await markJoined(session.id);
  }
  return NextResponse.json({ received: true });
}
