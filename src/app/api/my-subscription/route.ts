import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const userId = (session.user as any).id;
  const { data } = await supabase.from("subscriptions").select("*").eq("user_id", userId).single();
  return NextResponse.json({ subscription: data || null });
}