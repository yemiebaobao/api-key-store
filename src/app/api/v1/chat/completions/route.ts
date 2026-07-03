import { NextRequest } from "next/server";
import { getUserByApiKey, proxyToDeepSeek } from "@/lib/relay";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const apiKey = auth.replace("Bearer ", "").trim();

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "请提供 API Key（Authorization: Bearer sk_xxx）" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const user = await getUserByApiKey(apiKey);
  if (!user) {
    return new Response(JSON.stringify({ error: "API Key 无效" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "无效的 JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  return proxyToDeepSeek(user.user_id, body);
}