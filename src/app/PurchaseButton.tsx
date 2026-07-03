"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2, X, CheckCheck } from "lucide-react";
import { useState } from "react";

export function PurchaseButton({ planId, className }: { planId: string; className?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [payMethod, setPayMethod] = useState<"alipay"|"wechat">("alipay");

  async function handleBuy() {
    if (!session) { router.push("/login"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/pending-payments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.plan) { setModal(data); setDone(false); }
      else { alert(data.error || "创建失败"); }
    } catch { alert("网络错误"); }
    setLoading(false);
  }

  async function confirmPaid() {
    setSubmitting(true);
    try {
      await fetch("/api/pending-payments/set-paid", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderRef: modal.orderRef }),
      });
      setDone(true);
    } catch { alert("提交失败"); }
    setSubmitting(false);
  }

  function close() { setModal(null); setDone(false); }

  if (!modal) return (
    <button onClick={handleBuy} disabled={loading} className={className || "btn-primary mt-6 w-full text-sm"}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingCart className="mr-2 h-4 w-4" />购买</>}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={close}>
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative" onClick={e=>e.stopPropagation()}>
        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={close}><X className="h-5 w-5" /></button>

        {done ? (
          <div className="text-center py-4">
            <CheckCheck className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900 mt-4">已提交！</h2>
            <p className="text-sm text-gray-600 mt-2">管理员确认后到账</p>
            <button onClick={close} className="btn-primary mt-6">完成</button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 text-center">{modal.plan.name}</h2>
            <div className="text-center mt-2">
              <span className="text-5xl font-bold text-gray-900">¥{modal.plan.price}</span>
            </div>
            <p className="text-center text-sm text-gray-500 mt-1">{(modal.plan.tokens/10000).toFixed(0)} 万 Tokens</p>

            {/* Payment tabs */}
            <div className="mt-6 flex bg-gray-100 rounded-xl p-1">
              <button onClick={()=>setPayMethod("alipay")} className={"flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors "+(payMethod==="alipay"?"bg-white text-blue-600 shadow-sm":"text-gray-500")}>支付宝</button>
              <button onClick={()=>setPayMethod("wechat")} className={"flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors "+(payMethod==="wechat"?"bg-white text-green-600 shadow-sm":"text-gray-500")}>微信</button>
            </div>

            {/* QR Code */}
            <div className="mt-4 bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-gray-700 mb-3">
                请扫码支付 <strong>¥{modal.plan.price}</strong>
              </p>
              <div className="w-48 h-48 mx-auto bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                <img src={payMethod==="alipay"?"/alipay-qr.jpg":"/wechat-qr.jpg"} alt="qr" className="w-full h-full object-contain"
                  onError={e=>{(e.target as HTMLImageElement).outerHTML='<div class="text-gray-400 text-xs p-4">请将收款码放到<br/>public/'+(payMethod==="alipay"?"alipay-qr.jpg":"wechat-qr.jpg")+'</div>'}} />
              </div>
              <p className="mt-2 text-xs text-gray-400">订单: {modal.orderRef}</p>
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">付款后点击下方按钮确认</p>
            <button onClick={confirmPaid} disabled={submitting} className="btn-primary w-full mt-3">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "我已付款"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}