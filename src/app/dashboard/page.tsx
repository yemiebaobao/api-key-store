"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Key, Loader2, Copy, CheckCheck, Coins, BarChart3, Crown } from "lucide-react";

interface BalanceData {
  balance: number; total_used: number; api_key: string; recent_logs: any[];
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<BalanceData | null>(null);
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const justBought = searchParams.get("bought") === "true";

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") { fetchAll(); }
  }, [status]);

  async function fetchAll() {
    try {
      const [balRes, subRes] = await Promise.all([
        fetch("/api/balance"),
        fetch("/api/my-subscription"),
      ]);
      setData(await balRes.json());
      const subData = await subRes.json();
      setSub(subData.subscription);
    } catch { console.error("Failed"); }
    finally { setLoading(false); }
  }

  function copyKey() { if (!data?.api_key) return; navigator.clipboard.writeText(data.api_key); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  if (status === "loading") return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  const bal = data?.balance ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {justBought && <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">Credits added! Start using your API Key below.</div>}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your credits and API access</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
      ) : (
        <div className="space-y-6">
          {/* VIP Banner */}
          {sub && sub.active && (
            <div className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-5 text-white">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-yellow-300" />
                <div>
                  <p className="font-bold text-lg">VIP Active</p>
                  <p className="text-sm text-purple-100">{(sub.tokens_per_month / 10000).toFixed(0)}M tokens / month</p>
                  <p className="text-xs text-purple-200 mt-1">Next: {sub.next_renewal ? new Date(sub.next_renewal).toLocaleDateString("zh-CN") : "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <Coins className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-3xl font-bold text-gray-900">{(bal / 10000).toFixed(0)}<span className="text-lg font-normal text-gray-500">M Tokens</span></p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Used</p>
                  <p className="text-3xl font-bold text-gray-900">{data?.total_used ? (data.total_used / 10000).toFixed(1) : 0}<span className="text-lg font-normal text-gray-500">M Tokens</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-3 font-semibold text-gray-900">Your API Key</h3>
            <p className="mb-3 text-xs text-gray-500">Use this key to call our API (OpenAI compatible)</p>
            {data?.api_key ? (
              <div className="flex items-center gap-2">
                <code className="break-all rounded-lg bg-gray-100 px-4 py-2.5 font-mono text-sm text-gray-800 flex-1">{data.api_key}</code>
                <button onClick={copyKey} className="flex-shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">{copied ? <CheckCheck className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}</button>
              </div>
            ) : <p className="text-sm text-gray-400">Loading...</p>}
          </div>
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