import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateApiKey } from "@/lib/relay";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const userId = (session.user as any).id;
  const apiKey = await getOrCreateApiKey(userId);
  return NextResponse.json({ api_key: apiKey });
}