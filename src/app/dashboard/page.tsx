"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Key, Loader2, Copy, CheckCheck } from "lucide-react";

interface AssignedKey {
  id: string;
  key: string;
  assigned_at: string;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keys, setKeys] = useState<AssignedKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const justBought = searchParams.get("bought") === "true";

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") { fetchKeys(); }
  }, [status]);

  async function fetchKeys() {
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      setKeys(data.keys ?? []);
    } catch { console.error("Failed to fetch keys"); }
    finally { setLoading(false); }
  }

  function copyKey(key: string, id: string) {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (status === "loading") {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {justBought && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
          购买成功！你的 API Key 已显示在下方，请立即复制保存。
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">我的 API Key</h1>
        <p className="mt-1 text-sm text-gray-600">你购买的 API Key 都在这里，复制后即可使用</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
      ) : keys.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Key className="mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">还没有购买 API Key</h3>
          <p className="mt-2 text-sm text-gray-500">去首页购买一个，立即开始使用</p>
          <button onClick={() => router.push("/")} className="btn-primary mt-6">去购买</button>
        </div>
      ) : (
        <div className="space-y-4">
          {keys.map((ak) => (
            <div key={ak.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-gray-500">购买于 {new Date(ak.assigned_at).toLocaleDateString("zh-CN")}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="break-all rounded-lg bg-gray-100 px-4 py-2.5 font-mono text-sm text-gray-800">{ak.key}</code>
                    <button onClick={() => copyKey(ak.key, ak.id)} className="flex-shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600" title="复制 Key">
                      {copiedId === ak.id ? <CheckCheck className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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