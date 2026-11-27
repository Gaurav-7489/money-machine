import Stripe from "stripe";

let client: Stripe | null = null;

/** Server-side Stripe client, or null when STRIPE_SECRET_KEY is not set yet. */
export function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}
