import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET() {
  try {
    const { data: subs } = await supabase.from("subscriptions").select("*").lte("next_renewal", new Date().toISOString()).eq("active", true);
    let renewed = 0;
    if (subs) {
      for (const sub of subs) {
        const { data: bal } = await supabase.from("user_balances").select("balance").eq("user_id", sub.user_id).single();
        if (bal) {
          await supabase.from("user_balances").update({ balance: bal.balance + sub.tokens_per_month }).eq("user_id", sub.user_id);
        } else {
          await supabase.from("user_balances").insert({ user_id: sub.user_id, balance: sub.tokens_per_month, total_used: 0 });
        }
        await supabase.from("subscriptions").update({
          last_renewed: new Date().toISOString(),
          next_renewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }).eq("id", sub.id);
        renewed++;
      }
    }
    return NextResponse.json({ renewed, checked: subs?.length || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}