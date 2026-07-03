import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderRef = searchParams.get("order") || "";

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const userId = (session.user as any).id;
  const { data } = await supabase
    .from("pending_payments")
    .select("status, plan_id, tokens")
    .eq("order_ref", orderRef)
    .eq("user_id", userId)
    .single();

  return NextResponse.json({ status: data?.status || "unknown", tokens: data?.tokens || 0 });
}