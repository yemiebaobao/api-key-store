import crypto from "crypto";
const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

export interface Plan {
  id: string;
  name: string;
  price: number;
  priceCents: number;
  tokens: number;
  description: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 2.99,
    priceCents: 299,
    tokens: 1000000,
    description: "For personal use and testing",
    features: ["1M Tokens", "OpenAI compatible", "No expiry"],
  },
  {
    id: "standard",
    name: "Standard",
    price: 19.99,
    priceCents: 1999,
    tokens: 10000000,
    description: "For daily development",
    features: ["10M Tokens", "OpenAI compatible", "No expiry", "Best value"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49.99,
    priceCents: 4999,
    tokens: 30000000,
    description: "For high frequency usage",
    features: ["30M Tokens", "OpenAI compatible", "No expiry", "Lowest unit price"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 79.99,
    priceCents: 7999,
    tokens: 80000000,
    description: "For teams and business",
    features: ["80M Tokens", "OpenAI compatible", "No expiry", "Priority support"],
  },
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export async function createCheckoutLink(options: {
  email: string;
  userId: string;
  planId: string;
}): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const plan = getPlanById(options.planId);
  if (!storeId || !variantId || !apiKey) throw new Error("Lemon Squeezy not configured");
  if (!plan) throw new Error("Invalid plan");

  const res = await fetch(LS_API_BASE + "/checkouts", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: options.email,
            custom_price: plan.priceCents,
            custom: { user_id: options.userId, plan_id: options.planId },
          },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("LS error:", err);
    throw new Error("Failed to create checkout");
  }

  const json = await res.json();
  return json.data.attributes.url;
}

export function verifyWebhook(body: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(body, "utf-8").digest("hex");
  try { return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature)); } catch { return false; }
}