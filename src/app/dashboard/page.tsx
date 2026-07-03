"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Key, Loader2, Copy, CheckCheck, Coins, BarChart3 } from "lucide-react";

interface BalanceData {
  balance: number;
  total_used: number;
  api_key: string;
  recent_logs: any[];
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const justBought = searchParams.get("bought") === "true";

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") { fetchData(); }
  }, [status]);

  async function fetchData() {
    try {
      const res = await fetch("/api/balance");
      const d = await res.json();
      setData(d);
    } catch { console.error("Failed"); }
    finally { setLoading(false); }
  }

  function copyKey() {
    if (!data?.api_key) return;
    navigator.clipboard.writeText(data.api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (status === "loading") {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  const bal = data?.balance ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {justBought && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
          购买成功！100 万 Tokes 已到账，下方可以用你的 API Key 调用服务。
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">控制台</h1>
        <p className="mt-1 text-sm text-gray-600">管理你的 API 调用额度</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
      ) : (
        <div className="space-y-6">
          {/* 余额卡片 */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <Coins className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">剩余额度</p>
                  <p className="text-3xl font-bold text-gray-900">{(bal / 10000).toFixed(0)}<span className="text-lg font-normal text-gray-500"> 万 Tokens</span></p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">已使用</p>
                  <p className="text-3xl font-bold text-gray-900">{data?.total_used ? (data.total_used / 10000).toFixed(1) : 0}<span className="text-lg font-normal text-gray-500"> 万 Tokens</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* API Key */}
          <div className="card p-6">
            <h3 className="mb-3 font-semibold text-gray-900">你的 API Key</h3>
            <p className="mb-3 text-xs text-gray-500">调用我们的 API 时使用这个 Key（兼容 OpenAI 格式）</p>
            {data?.api_key ? (
              <div className="flex items-center gap-2">
                <code className="break-all rounded-lg bg-gray-100 px-4 py-2.5 font-mono text-sm text-gray-800 flex-1">{data.api_key}</code>
                <button onClick={copyKey} className="flex-shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="复制">
                  {copied ? <CheckCheck className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            ) : <p className="text-sm text-gray-400">加载中...</p>}
          </div>

          {/* 调用示例 */}
          <div className="card p-6">
            <h3 className="mb-3 font-semibold text-gray-900">调用方式</h3>
            <pre className="rounded-lg bg-gray-900 p-4 text-xs text-green-400 overflow-x-auto">
{`curl https://你的域名.vercel.app/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${data?.api_key || "sk_xxx"}" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "你好"}]
  }'`}
            </pre>
          </div>

          {/* 最近调用 */}
          {data?.recent_logs && data.recent_logs.length > 0 && (
            <div className="card p-6">
              <h3 className="mb-3 font-semibold text-gray-900">最近调用记录</h3>
              <div className="space-y-2">
                {data.recent_logs.map((log: any) => (
                  <div key={log.id} className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-2">
                    <span>{log.model || "deepseek-chat"}</span>
                    <span>{(log.total_tokens || 0).toLocaleString()} tokens</span>
                    <span className="text-gray-400">{new Date(log.created_at).toLocaleString("zh-CN")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}