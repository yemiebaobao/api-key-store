import { NextResponse } from "next/server";
import { getPlanById } from "@/lib/pricing";

// Battery plans
const BATTERY_PLANS = [
  { id: "day", name: "日卡", price: 9.9, days: 1, hours: 24 },
  { id: "week", name: "周卡", price: 39, days: 7, hours: 168 },
  { id: "month", name: "月卡", price: 99, days: 30, hours: 720 },
];

export async function POST(req: Request) {
  const { email, planId } = await req.json();
  if (!email || !planId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const plan = BATTERY_PLANS.find(p => p.id === planId);
  if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const orderRef = "BAT" + Date.now().toString(36).toUpperCase();

  const { supabase } = await import("@/lib/db");
  await supabase.from("battery_purchases").insert({
    user_email: email,
    plan: planId,
    price: Math.round(plan.price),
    duration_hours: plan.hours,
    status: "pending",
    order_ref: orderRef,
  });

  return NextResponse.json({
    plan: { name: plan.name, price: plan.price, days: plan.days },
    orderRef,
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || "";

  const { supabase } = await import("@/lib/db");
  const { data } = await supabase
    .from("battery_purchases")
    .select("*")
    .eq("user_email", email)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return NextResponse.json({ active: false });

  const now = new Date();
  const expires = new Date(data.expires_at);
  if (now > expires) {
    await supabase.from("battery_purchases").update({ status: "expired" }).eq("id", data.id);
    return NextResponse.json({ active: false });
  }

  const remainingMs = expires.getTime() - now.getTime();
  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingDays = Math.floor(remainingHours / 24);
  const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  return NextResponse.json({
    active: true,
    remaining: { days: remainingDays, hours: remainingHours % 24, minutes: remainingMinutes },
    plan: data.plan,
    expiresAt: data.expires_at,
  });
}