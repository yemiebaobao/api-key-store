export interface Plan {
  id: string; name: string; price: number; priceCents: number;
  tokens: number; description: string; features: string[]; isSubscription?: boolean;
}

export const PLANS: Plan[] = [
  { id: "starter", name: "Starter", price: 2.99, priceCents: 299, tokens: 1000000, description: "For personal use", features: ["1M Tokens", "OpenAI compatible", "No expiry"] },
  { id: "standard", name: "Standard", price: 19.99, priceCents: 1999, tokens: 10000000, description: "Best for daily use", features: ["10M Tokens", "OpenAI compatible", "No expiry", "Best value"] },
  { id: "pro", name: "Pro", price: 49.99, priceCents: 4999, tokens: 30000000, description: "For high frequency", features: ["30M Tokens", "OpenAI compatible", "No expiry", "Lowest unit price"] },
  { id: "enterprise", name: "Enterprise", price: 79.99, priceCents: 7999, tokens: 80000000, description: "For business", features: ["80M Tokens", "OpenAI compatible", "No expiry", "Volume discount"] },
  { id: "vip", name: "Monthly VIP", price: 39, priceCents: 3900, tokens: 10000000, description: "Auto top-up every month", features: ["10M Tokens/month", "Auto renew", "Cancel anytime", "Save 43% vs one-time"], isSubscription: true },
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}
