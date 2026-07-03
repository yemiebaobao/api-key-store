import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/db";
import { ensureBalanceRecord } from "@/lib/relay";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "yemiebaobao@outlook.com";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { action, email, tokens } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const { data: user } = await supabase.from("users").select("id").eq("email", email).single();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (action === "add-tokens") {
      if (!tokens || tokens <= 0) return NextResponse.json({ error: "Invalid tokens" }, { status: 400 });
      await ensureBalanceRecord(user.id);
      const { data: bal } = await supabase.from("user_balances").select("balance").eq("user_id", user.id).single();
      await supabase.from("user_balances").update({ balance: (bal?.balance || 0) + tokens }).eq("user_id", user.id);
      return NextResponse.json({ success: true, action: "add-tokens", email, tokens });
    }

    if (action === "set-subscription") {
      const tokensPerMonth = tokens || 10000000;
      // Check if already has subscription
      const { data: existing } = await supabase.from("subscriptions").select("id").eq("user_id", user.id).single();
      if (existing) {
        await supabase.from("subscriptions").update({
          active: true, tokens_per_month: tokensPerMonth,
          next_renewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }).eq("id", existing.id);
      } else {
        await supabase.from("subscriptions").insert({
          user_id: user.id, plan: "monthly_vip", tokens_per_month: tokensPerMonth,
          next_renewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
      // Also give first month tokens
      await ensureBalanceRecord(user.id);
      const { data: bal } = await supabase.from("user_balances").select("balance").eq("user_id", user.id).single();
      await supabase.from("user_balances").update({ balance: (bal?.balance || 0) + tokensPerMonth }).eq("user_id", user.id);
      return NextResponse.json({ success: true, action: "set-subscription", email, tokensPerMonth });
    }

    if (action === "renew") {
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single();
      if (!sub) return NextResponse.json({ error: "No subscription" }, { status: 400 });
      await ensureBalanceRecord(user.id);
      const { data: bal } = await supabase.from("user_balances").select("balance").eq("user_id", user.id).single();
      await supabase.from("user_balances").update({ balance: (bal?.balance || 0) + sub.tokens_per_month }).eq("user_id", user.id);
      await supabase.from("subscriptions").update({
        last_renewed: new Date().toISOString(),
        next_renewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }).eq("id", sub.id);
      return NextResponse.json({ success: true, action: "renew", email, tokens: sub.tokens_per_month });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}