// API 中转系统
import { supabase } from "./db";

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";

// ─── 余额 ───

export async function getBalance(userId: string): Promise<{ balance: number; total_used: number }> {
  const { data } = await supabase.from("user_balances").select("balance, total_used").eq("user_id", userId).single();
  return data || { balance: 0, total_used: 0 };
}

export async function ensureBalanceRecord(userId: string) {
  const { data } = await supabase.from("user_balances").select("user_id").eq("user_id", userId).single();
  if (!data) {
    await supabase.from("user_balances").insert({ user_id: userId, balance: 0, total_used: 0 });
  }
}

export async function addTokens(userId: string, tokens: number) {
  await ensureBalanceRecord(userId);
  const { data } = await supabase.from("user_balances").select("balance").eq("user_id", userId).single();
  if (data) {
    await supabase.from("user_balances").update({ balance: data.balance + tokens }).eq("user_id", userId);
  }
}

// ─── 用户的 API Key ───

export async function getOrCreateApiKey(userId: string): Promise<string> {
  const { data } = await supabase.from("user_api_keys").select("api_key").eq("user_id", userId).single();
  if (data) return data.api_key;
  const apiKey = "sk_" + crypto.randomUUID().replace(/-/g, "");
  await supabase.from("user_api_keys").insert({ user_id: userId, api_key: apiKey });
  return apiKey;
}

export async function getUserByApiKey(apiKey: string) {
  const { data } = await supabase.from("user_api_keys").select("user_id").eq("api_key", apiKey).single();
  return data;
}

// ─── Token 估算 ───

function estimateTokens(text: string): number {
  let tokens = 0;
  for (const ch of text) {
    tokens += (ch > "\u00ff") ? 2 : 0.4;
  }
  return Math.max(1, Math.ceil(tokens));
}

// ─── 代理转发 ───

export async function proxyToDeepSeek(userId: string, body: any): Promise<Response> {
  const { balance } = await getBalance(userId);
  if (balance <= 0) {
    return new Response(JSON.stringify({ error: "余额不足，请充值" }), { status: 402, headers: { "Content-Type": "application/json" } });
  }

  const promptText = JSON.stringify(body.messages || []);
  const promptTokens = estimateTokens(promptText);
  if (promptTokens > balance) {
    return new Response(JSON.stringify({ error: "余额不足" }), { status: 402, headers: { "Content-Type": "application/json" } });
  }

  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (!deepseekKey) {
    return new Response(JSON.stringify({ error: "服务端未配置" }), { status: 500, headers: { "Content-Type": "application/json" } });
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

    if (!resp.ok) {
      const err = await resp.text();
      return new Response(JSON.stringify({ error: "上游错误: " + err }), { status: resp.status, headers: { "Content-Type": "application/json" } });
    }

    const json = await resp.json();
    const usage = json.usage || {};
    const completionTokens = usage.completion_tokens || estimateTokens(JSON.stringify(json.choices?.[0]?.message?.content || ""));
    const totalTokens = usage.total_tokens || (promptTokens + completionTokens);

    // 扣费
    const { data: bal } = await supabase.from("user_balances").select("balance, total_used").eq("user_id", userId).single();
    if (bal) {
      await supabase.from("user_balances").update({
        balance: Math.max(0, bal.balance - totalTokens),
        total_used: (bal.total_used || 0) + totalTokens,
      }).eq("user_id", userId);
    }

    // 记录
    await supabase.from("usage_logs").insert({
      user_id: userId, model: body.model || "deepseek-chat",
      prompt_tokens: promptTokens, completion_tokens: completionTokens,
      total_tokens: totalTokens, cost: totalTokens,
    });

    return new Response(JSON.stringify(json), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "代理错误: " + e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// ─── 用量 ───

export async function getUsageStats(userId: string) {
  const { data: bal } = await supabase.from("user_balances").select("*").eq("user_id", userId).single();
  const { data: logs } = await supabase.from("usage_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10);
  return { balance: bal || { balance: 0, total_used: 0 }, logs: logs || [] };
}