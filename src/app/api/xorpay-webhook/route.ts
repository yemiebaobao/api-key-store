import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { verifySign, getConfig } from "@/lib/xorpay";
import { ensureBalanceRecord } from "@/lib/relay";

export async function POST(req: Request) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((v, k) => { params[k] = v.toString(); });

  const { appsecret } = getConfig();
  if (!appsecret || !verifySign(params, appsecret)) {
    return new Response("fail");
  }

  const orderRef = params.order_id || "";
  const tradeStatus = params.trade_status || "";

  if (tradeStatus === "success") {
    const { data: order } = await supabase
      .from("pending_payments")
      .select("*")
      .eq("order_ref", orderRef)
      .eq("status", "pending")
      .single();

    if (order) {
      await ensureBalanceRecord(order.user_id);
      const { data: bal } = await supabase
        .from("user_balances")
        .select("balance")
        .eq("user_id", order.user_id)
        .single();
      await supabase
        .from("user_balances")
        .update({ balance: (bal?.balance || 0) + order.tokens })
        .eq("user_id", order.user_id);
      await supabase
        .from("pending_payments")
        .update({ status: "confirmed" })
        .eq("id", order.id);
      console.log("Auto confirmed: " + orderRef + " - " + order.tokens + " tokens to " + order.user_id);
    }
  }

  return new Response("success");
}