import { NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/lemonsqueezy";
import { assignAvailableKey } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-signature") ?? "";
  if (!verifyWebhook(body, signature)) {
    console.error("Lemon Squeezy webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let payload: any;
  try { payload = JSON.parse(body); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const eventName = payload.meta?.event_name;
  const customData = payload.meta?.custom_data || {};
  const orderData = payload.data?.attributes || {};
  if (eventName === "order_created" && orderData.status === "paid") {
    const userId = customData.user_id;
    const orderId = payload.data?.id || "unknown";
    if (!userId) { console.error("Webhook missing user_id"); return NextResponse.json({ error: "Missing user_id" }, { status: 400 }); }
    const assigned = await assignAvailableKey(userId, orderId);
    if (!assigned) { console.error("Key pool is empty for user " + userId); }
    else { console.log("Key assigned to user " + userId); }
  }
  return NextResponse.json({ received: true });
}