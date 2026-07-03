"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCheck, X } from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [tokens, setTokens] = useState("10000000");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"tokens"|"vip">("tokens");
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      fetch("/api/admin/check").then(r=>r.json()).then(d=>{ setIsAdmin(d.isAdmin); if(d.isAdmin) loadPayments(); });
    }
  }, [status]);

  async function loadPayments() {
    const r = await fetch("/api/pending-payments"); setPayments((await r.json()).payments || []);
  }

  async function handlePayment(id: string, action: string) {
    await fetch("/api/pending-payments", { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({id, action}) });
    loadPayments();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/admin/add-credits", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({action: mode==="vip"?"set-subscription":"add-tokens", email, tokens:parseInt(tokens)}) });
      const d = await r.json();
      if (r.ok) setResult({ type:"success", msg:"OK" }); else setResult({ type:"error", msg:d.error });
      setEmail("");
    } catch(e: any) { setResult({ type:"error", msg:e.message }); }
    setLoading(false);
  }

  if (status==="loading" || isAdmin===null) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (isAdmin===false) { router.push("/"); return null; }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">管理后台</h1>
      <p className="text-sm text-gray-500 mb-6">登录: {session?.user?.email}</p>

      {/* Pending payments */}
      {payments.filter(p=>p.status==="pending").length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">待确认付款</h2>
          <div className="space-y-3">
            {payments.filter(p=>p.status==="pending").map(p => (
              <div key={p.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{p.user_email}</p>
                  <p className="text-sm text-gray-500">{p.plan_id} - ¥{p.amount} - {(p.tokens/10000).toFixed(0)}万 Tokens</p>
                  <p className="text-xs text-gray-400">订单: {p.order_ref} | {new Date(p.created_at).toLocaleString("zh-CN")}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>handlePayment(p.id,"confirm")} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">确认到账</button>
                  <button onClick={()=>handlePayment(p.id,"reject")} className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">拒绝</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add credits / Set VIP */}
      <div className="flex gap-2 mb-6">
        <button onClick={()=>setMode("tokens")} className={"px-4 py-2 text-sm rounded-xl border "+(mode==="tokens"?"bg-blue-600 text-white border-blue-600":"border-gray-300 text-gray-600")}>加额度</button>
        <button onClick={()=>setMode("vip")} className={"px-4 py-2 text-sm rounded-xl border "+(mode==="vip"?"bg-purple-600 text-white border-purple-600":"border-gray-300 text-gray-600")}>设 VIP</button>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-5 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">用户邮箱</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input-field" required />
        </div>
        <div className="flex gap-3">
          <input type="number" value={tokens} onChange={e=>setTokens(e.target.value)} className="input-field flex-1" min="1" required />
          <button type="submit" disabled={loading} className={(mode==="vip"?"bg-purple-600 hover:bg-purple-700 ":"")+"btn-primary px-5"}>{loading?<Loader2 className="h-4 w-4 animate-spin" />:(mode==="vip"?"设 VIP":"加额度")}</button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{l:"100万",v:"1000000"},{l:"1000万",v:"10000000"},{l:"3000万",v:"30000000"},{l:"8000万",v:"80000000"}].map(p => (
            <button key={p.v} type="button" onClick={()=>setTokens(p.v)} className={"text-xs px-3 py-1 rounded-full border "+(tokens===p.v?"bg-blue-600 text-white border-blue-600":"border-gray-300 text-gray-600")}>{p.l}</button>
          ))}
        </div>
        {result && <div className={"rounded-lg px-4 py-3 text-sm "+(result.type==="success"?"bg-green-50 text-green-800":"bg-red-50 text-red-700")}>{result.type==="success"&&<CheckCheck className="inline h-4 w-4 mr-1" />}{result.msg}</div>}
      </form>

      {/* History */}
      {payments.filter(p=>p.status!=="pending").length>0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">历史记录</h2>
          {payments.filter(p=>p.status!=="pending").slice(0,10).map(p => (
            <div key={p.id} className="text-sm text-gray-500 py-2 border-b border-gray-100 flex justify-between">
              <span>{p.user_email} - {p.plan_id}</span>
              <span className={p.status==="confirmed"?"text-green-600":"text-red-600"}>{p.status==="confirmed"?"已确认":"已拒绝"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}