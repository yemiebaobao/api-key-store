import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPlanById } from "@/lib/pricing";
import { supabase } from "@/lib/db";
import { createOrder, getConfig } from "@/lib/xorpay";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { planId } = await req.json();
  const plan = getPlanById(planId);
  if (!plan) return NextResponse.json({ error: "无效的套餐" }, { status: 400 });

  const userId = (session.user as any).id;
  const userEmail = session.user.email || "";
  const orderRef = "ORD" + Date.now().toString(36).toUpperCase();

  // Save pending order
  await supabase.from("pending_payments").insert({
    user_id: userId, user_email: userEmail, plan_id: planId,
    amount: Math.round(plan.price), tokens: plan.tokens,
    status: "pending", order_ref: orderRef,
  });

  // Try XorPay auto payment
  const xorpayConfig = getConfig();
  if (xorpayConfig.configured) {
    const xorResult = await createOrder({
      price: plan.price,
      orderId: orderRef,
      notifyUrl: process.env.NEXT_PUBLIC_APP_URL + "/api/xorpay-webhook",
    });
    if (xorResult && xorResult.qrCode) {
      return NextResponse.json({
        method: "auto",
        orderRef,
        qrCode: xorResult.qrCode,
        payUrl: xorResult.payUrl,
        price: plan.price,
        plan: { name: plan.name, tokens: plan.tokens, isSubscription: plan.isSubscription },
      });
    }
  }

  // Fallback: manual QR
  return NextResponse.json({
    method: "manual",
    plan: { name: plan.name, price: plan.price, tokens: plan.tokens, isSubscription: plan.isSubscription },
    orderRef,
    alipayQr: "/alipay-qr.jpg",
    note: "支付宝扫码付 " + plan.price + " 元，付完自动到账",
  });
}