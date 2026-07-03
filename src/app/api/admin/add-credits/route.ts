import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { ensureBalanceRecord } from "@/lib/relay";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "yemiebaobao@outlook.com";

export async function POST(req: Request) {
  try {
    // Check session via header
    const callerEmail = req.headers.get("x-user-email") || "";
    
    // Simple auth: must be logged in as admin
    if (callerEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { email, tokens } = await req.json();
    if (!email || !tokens || tokens <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { data: user } = await supabase.from("users").select("id").eq("email", email).single();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await ensureBalanceRecord(user.id);
    const { data: bal } = await supabase.from("user_balances").select("balance").eq("user_id", user.id).single();
    await supabase.from("user_balances").update({ balance: (bal?.balance || 0) + tokens }).eq("user_id", user.id);

    return NextResponse.json({ success: true, email, tokens });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}