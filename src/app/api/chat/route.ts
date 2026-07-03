import { NextRequest } from "next/server";

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";

export async function POST(req: NextRequest) {
  let body;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 }); }

  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (!deepseekKey) {
    return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500 });
  }

  try {
    const resp = await fetch(DEEPSEEK_API, {
      method: "POST",
      headers: { Authorization: "Bearer " + deepseekKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: body.model || "deepseek-chat",
        messages: body.messages,
        temperature: body.temperature,
        max_tokens: body.max_tokens,
        stream: false,
      }),
    });

    const data = await resp.json();
    return new Response(JSON.stringify(data), {
      status: resp.ok ? 200 : resp.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
