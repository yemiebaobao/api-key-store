import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/db";
import { getPlanById } from "@/lib/pricing";
import { ensureBalanceRecord } from "@/lib/relay";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "yemiebaobao@outlook.com";

// 创建待支付订单
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { planId } = await req.json();
  const plan = getPlanById(planId);
  if (!plan) return NextResponse.json({ error: "无效的套餐" }, { status: 400 });

  const userId = (session.user as any).id;
  const orderRef = "ORD" + Date.now().toString(36).toUpperCase();

  // 存入待支付
  await supabase.from("pending_payments").insert({
    user_id: userId,
    user_email: session.user.email,
    plan_id: planId,
    amount: plan.price,
    tokens: plan.tokens,
    status: "pending",
    order_ref: orderRef,
  });

  return NextResponse.json({
    plan,
    orderRef,
    alipayQr: "/alipay-qr.jpg",
    note: "请用支付宝扫码支付 " + plan.price + " 元，支付后点"我已付款"",
  });
}

// Admin 确认收款
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== ADMIN_EMAIL) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { id, action } = await req.json();
  const { data: payment } = await supabase.from("pending_payments").select("*").eq("id", id).single();
  if (!payment) return NextResponse.json({ error: "订单不存在" }, { status: 404 });

  if (action === "confirm") {
    await ensureBalanceRecord(payment.user_id);
    const { data: bal } = await supabase.from("user_balances").select("balance").eq("user_id", payment.user_id).single();
    await supabase.from("user_balances").update({ balance: (bal?.balance || 0) + payment.tokens }).eq("user_id", payment.user_id);
    await supabase.from("pending_payments").update({ status: "confirmed" }).eq("id", id);
    return NextResponse.json({ success: true });
  }

  if (action === "reject") {
    await supabase.from("pending_payments").update({ status: "rejected" }).eq("id", id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "无效操作" }, { status: 400 });
}

// 查看待支付（Admin 用）
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const { data } = await supabase.from("pending_payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ payments: data || [] });
}