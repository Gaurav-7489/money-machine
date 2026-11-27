import { NextResponse } from "next/server";
import { isSide, PLANS } from "@/lib/plans";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Starts an embedded Stripe Checkout: the first month for $1 today, then the
 * monthly price. Body: { side: "creator" | "business" }. The price comes from
 * PLANS on the server; nothing price-related is read from the request.
 */
export async function POST(req: Request) {
  const s = stripe();
  if (!s) return NextResponse.json({ error: "Payments are not switched on yet." }, { status: 503 });

  const body = (await req.json().catch(() => null)) as { side?: unknown } | null;
  if (!isSide(body?.side)) return NextResponse.json({ error: "Choose creator or business." }, { status: 400 });
  const side = body.side;
  const plan = PLANS[side];
  const origin = new URL(req.url).origin;

  try {
    const session = await s.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: plan.monthly * 100,
            recurring: { interval: "month" },
            product_data: { name: `Money Machine · ${plan.label}`, description: `$${plan.monthly}/month after your first month. Cancel anytime.` },
          },
        },
        { quantity: 1, price_data: { currency: "usd", unit_amount: plan.firstMonth * 100, product_data: { name: "Money Machine · first month" } } },
      ],
      // The one-time $1 line above is charged today; the monthly price starts after the first month.
      subscription_data: { trial_period_days: 30, metadata: { side } },
      metadata: { side },
      custom_text: { submit: { message: `$${plan.firstMonth} today, then $${plan.monthly}/month. Cancel anytime.` } },
      return_url: `${origin}/onboarding?role=${side}&session_id={CHECKOUT_SESSION_ID}`,
    });
    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (e) {
    console.error("checkout: could not create session", e);
    return NextResponse.json({ error: "We couldn't start checkout. Please try again." }, { status: 502 });
  }
}
