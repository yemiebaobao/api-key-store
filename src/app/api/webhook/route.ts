import { NextResponse } from "next/server";
import { verifyWebhook, getPlanById } from "@/lib/lemonsqueezy";
import { addTokens, ensureBalanceRecord } from "@/lib/relay";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("x-signature") ?? "";
  if (!verifyWebhook(body, sig)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  let payload: any;
  try { payload = JSON.parse(body); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (payload.meta?.event_name === "order_created") {
    const userId = payload.meta?.custom_data?.user_id;
    const planId = payload.meta?.custom_data?.plan_id || "standard";
    const plan = getPlanById(planId);
    if (!userId || !plan) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    await ensureBalanceRecord(userId);
    await addTokens(userId, plan.tokens);
    console.log("Added " + (plan.tokens / 10000) + "m tokens to user " + userId);
  }

  return NextResponse.json({ received: true });
}