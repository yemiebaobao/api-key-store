import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBalance, getUsageStats, getOrCreateApiKey } from "@/lib/relay";
import { getUserByEmail } from "@/lib/db";

export async function GET(req: NextRequest) {
  // Email param (for desktop app)
  const email = req.nextUrl.searchParams.get("email");
  if (email) {
    const user = await getUserByEmail(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const stats = await getUsageStats(user.id);
    const apiKey = await getOrCreateApiKey(user.id);
    return NextResponse.json({ balance: stats.balance.balance, total_used: stats.balance.total_used, api_key: apiKey });
  }

  // Session-based (for web app)
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "please login" }, { status: 401 });
  const userId = (session.user as any).id;
  const stats = await getUsageStats(userId);
  const apiKey = await getOrCreateApiKey(userId);
  return NextResponse.json({ balance: stats.balance.balance, total_used: stats.balance.total_used, api_key: apiKey, recent_logs: stats.logs });
}
