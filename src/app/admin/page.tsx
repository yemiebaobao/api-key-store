"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCheck } from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [tokens, setTokens] = useState("10000000");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mode, setMode] = useState<"tokens"|"vip"|"battery">("tokens");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      fetch("/api/admin/check").then(r=>r.json()).then(d => { setIsAdmin(d.isAdmin); if(d.isAdmin) loadData(); });
    }
  }, [status]);

  async function loadData() {
    const [batteryRes] = await Promise.all([fetch("/api/battery-purchase/confirm")]);
    const batteryData = await batteryRes.json();
    setPayments(batteryData.purchases || []);
  }

  async function handleBattery(id: string, action: string) {
    await fetch("/api/battery-purchase/confirm", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id, action}) });
    loadData();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/admin/add-credits", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action:mode==="vip"?"set-subscription":"add-tokens", email, tokens:parseInt(tokens)}) });
      const d = await r.json();
      setResult({ type: r.ok ? "success" : "error", msg: d.error || "OK" });
      setEmail("");
    } catch(e: any) { setResult({ type:"error", msg: e.message }); }
    setLoading(false);
  }

  if (status==="loading" || isAdmin===null) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (isAdmin===false) { router.push("/"); return null; }

  const pending = payments.filter(p=>p.status==="pending");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">管理后台</h1>
      <p className="text-sm text-gray-500 mb-6">登录: {session?.user?.email}</p>

      {/* Battery purchases */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">待确认电量充值</h2>
          <div className="space-y-3">
            {pending.map(p => (
              <div key={p.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{p.user_email}</p>
                  <p className="text-sm text-gray-500">{p.plan} - ¥{p.price} - {p.duration_hours}小时</p>
                  <p className="text-xs text-gray-400">订单: {p.order_ref} | {new Date(p.created_at).toLocaleString("zh-CN")}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>handleBattery(p.id,"confirm")} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">确认</button>
                  <button onClick={()=>handleBattery(p.id,"reject")} className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">拒绝</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}