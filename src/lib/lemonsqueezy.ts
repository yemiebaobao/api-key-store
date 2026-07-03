import crypto from "crypto";

const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

export const PRODUCT = {
  name: "API Key",
  price: 19.99,
  priceCents: 1999,
  description: "获得一个专属 API Key，用于访问我们的服务",
  features: [
    "1 个专属 API Key",
    "永久有效",
    "无限调用次数",
    "技术支持",
  ],
};

export async function createCheckoutLink(options: {
  email: string;
  userId: string;
}): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;

  if (!storeId || !variantId || !apiKey) {
    throw new Error("Lemon Squeezy 未配置，请检查环境变量");
  }

  const res = await fetch(LS_API_BASE + "/checkouts", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: options.email,
            custom_price: PRODUCT.priceCents,
            custom: { user_id: options.userId },
            redirect_url: process.env.NEXT_PUBLIC_APP_URL + "/dashboard?bought=true",
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
    console.error("Lemon Squeezy checkout error:", err);
    throw new Error("创建支付链接失败");
  }

  const json = await res.json();
  return json.data.attributes.url;
}

export function verifyWebhook(body: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(body, "utf-8").digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}