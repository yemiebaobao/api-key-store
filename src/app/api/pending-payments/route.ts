import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/db";
import { getPlanById } from "@/lib/pricing";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { planId } = await req.json();
  const plan = getPlanById(planId);
  if (!plan) return NextResponse.json({ error: "无效的套餐" }, { status: 400 });

  const userId = (session.user as any).id;
  const orderRef = "ORD" + Date.now().toString(36).toUpperCase();

  // Try to save to DB, but show QR even if DB fails
  try {
    await supabase.from("pending_payments").insert({
      user_id: userId, user_email: session.user.email, plan_id: planId,
      amount: Math.round(plan.price), tokens: plan.tokens,
      status: "pending", order_ref: orderRef,
    });
  } catch (e) {
    console.log("DB save failed (table may not exist), showing QR anyway");
  }

  return NextResponse.json({
    plan: { name: plan.name, price: plan.price, tokens: plan.tokens, isSubscription: !!plan.isSubscription },
    orderRef,
  });
}