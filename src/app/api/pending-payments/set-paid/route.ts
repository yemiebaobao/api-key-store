import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { orderRef } = await req.json();
  const userId = (session.user as any).id;

  const { data: order } = await supabase
    .from("pending_payments")
    .select("*")
    .eq("order_ref", orderRef)
    .eq("user_id", userId)
    .single();

  if (!order) return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  if (order.status !== "pending") return NextResponse.json({ error: "订单已处理" }, { status: 400 });

  // Mark as paid_by_user - admin can now confirm
  await supabase.from("pending_payments").update({ status: "paid_by_user" }).eq("id", order.id);

  return NextResponse.json({ success: true });
}