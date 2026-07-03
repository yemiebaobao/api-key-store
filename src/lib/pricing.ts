export interface Plan {
  id: string; name: string; price: number; priceCents: number;
  tokens: number; description: string; features: string[]; isSubscription?: boolean;
}

export const PLANS: Plan[] = [
  { id: "starter", name: "体验版", price: 9.9, priceCents: 990, tokens: 1000000, description: "低价尝鲜", features: ["100 万 Tokens", "兼容 OpenAI", "永不过期"] },
  { id: "standard", name: "标准版", price: 69, priceCents: 6900, tokens: 10000000, description: "日常使用首选", features: ["1000 万 Tokens", "兼容 OpenAI", "永不过期", "性价比最高"] },
  { id: "pro", name: "专业版", price: 169, priceCents: 16900, tokens: 30000000, description: "适合高频用户", features: ["3000 万 Tokens", "兼容 OpenAI", "永不过期", "单价更优"] },
  { id: "enterprise", name: "企业版", price: 299, priceCents: 29900, tokens: 80000000, description: "适合商业项目", features: ["8000 万 Tokens", "兼容 OpenAI", "永不过期", "量大价优"] },
  { id: "vip", name: "月度 VIP", price: 39, priceCents: 3900, tokens: 10000000, description: "每月自动到账 1000 万", features: ["每月 1000 万 Tokens", "自动续费", "随时取消", "比单买省 43%"], isSubscription: true },
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}