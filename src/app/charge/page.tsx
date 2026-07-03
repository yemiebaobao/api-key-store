"use client";

import { useState } from "react";
import { Loader2, CheckCheck, Zap } from "lucide-react";
import Link from "next/link";

const PLANS = [
  { id: "day", name: "日卡", price: 9.9, days: 1, desc: "24 小时无限使用", popular: false },
  { id: "week", name: "周卡", price: 39, days: 7, desc: "7 天无限使用", popular: true },
  { id: "month", name: "月卡", price: 99, days: 30, desc: "30 天无限使用", popular: false },
];

export default function ChargePage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"plans" | "qr" | "done">("plans");
  const [selected, setSelected] = useState<any>(null);
  const [orderRef, setOrderRef] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleBuy(plan: any) {
    if (!email || !email.includes("@")) { alert("请输入有效邮箱"); return; }
    setSelected(plan);
    setLoading(true);
    try {
      const res = await fetch("/api/battery-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, planId: plan.id }),
      });
      const data = await res.json();
      if (data.orderRef) { setOrderRef(data.orderRef); setStep("qr"); }
      else { alert(data.error || "失败"); }
    } catch { alert("网络错误"); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-lg flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-gray-900">AI 充电站</span>
          </div>
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">主站</Link>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-10">
        {step === "plans" && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-1.5 text-sm text-yellow-700 mb-4">为桌面 AI 助手充电</div>
              <h1 className="text-2xl font-bold text-gray-900">选择充电时长</h1>
              <p className="mt-2 text-sm text-gray-500">购买后即可解锁全部高级功能</p>
            </div>

            {/* Email input */}
            <div className="mb-6">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="输入你的邮箱" required />
            </div>

            {/* Plans */}
            <div className="space-y-3">
              {PLANS.map(plan => (
                <div key={plan.id} className={"card p-5 flex items-center justify-between cursor-pointer transition-all hover:shadow-md " + (plan.popular ? "ring-2 ring-yellow-400" : "")}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{plan.name}</h3>
                      {plan.popular && <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">推荐</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{plan.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-900">¥{plan.price}</span>
                    <button onClick={() => handleBuy(plan)} disabled={loading} className="btn-primary text-sm px-5 py-2.5">
                      {loading && selected?.id === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "购买"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">支付后管理员确认到账，高级功能立即解锁</p>
          </>
        )}

        {step === "qr" && selected && (
          <div className="card p-8 text-center">
            <CheckCheck className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900 mt-4">订单已创建</h2>
            <p className="text-sm text-gray-500 mt-2">{selected.name} ¥{selected.price}</p>
            
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">支付宝扫码付款</p>
              <div className="w-44 h-44 mx-auto bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                <img src="/alipay-qr.jpg" alt="QR" className="w-full h-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).outerHTML = '<div class="text-gray-400 text-xs p-4">请将收款码放到<br/>public/alipay-qr.jpg</div>'; }} />
              </div>
              <p className="mt-2 text-xs text-gray-400">订单: {orderRef}</p>
            </div>

            <p className="text-xs text-gray-500 mt-4">付款后联系管理员确认到账</p>
            <button onClick={() => setStep("plans")} className="btn-secondary mt-4 text-sm">返回</button>
          </div>
        )}
      </div>
    </div>
  );
}