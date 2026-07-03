import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBalance, getUsageStats, getOrCreateApiKey } from "@/lib/relay";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const userId = (session.user as any).id;
  const stats = await getUsageStats(userId);
  const apiKey = await getOrCreateApiKey(userId);

  return NextResponse.json({
    balance: stats.balance.balance,
    total_used: stats.balance.total_used,
    api_key: apiKey,
    recent_logs: stats.logs,
  });
}