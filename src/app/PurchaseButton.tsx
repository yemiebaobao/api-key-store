"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2, X, CheckCheck, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";

export function PurchaseButton({ planId, className }: { planId: string; className?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [modal, setModal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);
  const [payMethod, setPayMethod] = useState<"alipay"|"wechat"|"card">("alipay");
  const [paid, setPaid] = useState(false);
  const [pollInterval, setPollInterval] = useState<any>(null);

  // Clean up polling on unmount
  useEffect(() => () => { if (pollInterval) clearInterval(pollInterval); }, [pollInterval]);

  async function handleBuy() {
    if (!session) { router.push("/login"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/purchase", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { alert(data.error || "Failed"); return; }
      setModal(data);
      setPaid(false);
      // Auto-poll if XorPay auto payment
      if (data.method === "auto" && data.orderRef) {
        const interval = setInterval(async () => {
          try {
            const sr = await fetch("/api/purchase/status?order=" + data.orderRef);
            const sd = await sr.json();
            if (sd.status === "confirmed" || sd.status === "paid_by_user") {
              setPaid(true);
              clearInterval(interval);
            }
          } catch {}
        }, 3000);
        setPollInterval(interval);
        // Stop polling after 10 min
        setTimeout(() => clearInterval(interval), 600000);
      }
    } catch { alert("Network error"); }
    setLoading(false);
  }

  async function payWithCard() {
    if (!session) { router.push("/login"); return; }
    setCardLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) { window.open(data.url, "_blank"); setPaid(true); }
      else { alert(data.error || "Card payment not configured"); }
    } catch { alert("Network error"); }
    setCardLoading(false);
  }

  async function confirmPaid() {
    try {
      await fetch("/api/pending-payments/set-paid", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderRef: modal.orderRef }),
      });
      setPaid(true);
    } catch { alert("Failed"); }
  }

  function close() { setModal(null); setPaid(false); if (pollInterval) clearInterval(pollInterval); }

  // Buy button (hidden when modal is open)
  if (!modal) return (
    <div>
      <button onClick={handleBuy} disabled={loading} className={className || "btn-primary mt-6 w-full text-sm"}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingCart className="mr-2 h-4 w-4" />Buy</>}
      </button>
      <button onClick={payWithCard} disabled={cardLoading} className="w-full mt-2 bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-900 disabled:opacity-50">
        {cardLoading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : <><CreditCard className="inline mr-1 h-4 w-4" /> Pay with Card (International)</>}
      </button>
    </div>
  );

  // Payment modal
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={close}>
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative" onClick={e=>e.stopPropagation()}>
        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={close}><X className="h-5 w-5" /></button>

        {paid ? (
          // Success screen
          <div className="text-center py-4">
            <CheckCheck className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900 mt-4">{modal.method === "card" ? "Payment sent!" : "Payment confirmed!"}</h2>
            <p className="text-sm text-gray-600 mt-2">
              {modal.method === "card" ? "Complete payment in the opened tab. Tokens will be added automatically." : "Tokens have been added to your account."}
            </p>
            <p className="text-sm font-medium text-blue-600 mt-2">+{((modal.plan?.tokens || 0)/10000).toFixed(0)}M Tokens</p>
            {modal.method !== "card" && <p className="text-xs text-gray-400 mt-1">Tokens credited automatically</p>}
            <button onClick={close} className="btn-primary mt-6">Done</button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 text-center">{modal.plan?.name || "Order"}</h2>
            <div className="text-center mt-2">
              <span className="text-3xl font-bold text-gray-900">{modal.price ? "¥" + modal.price : ""}</span>
            </div>
            <p className="text-center text-sm text-gray-500 mt-1">{((modal.plan?.tokens || 0)/10000).toFixed(0)}M Tokens</p>

            {/* Payment tabs */}
            <div className="mt-6 flex bg-gray-100 rounded-xl p-1">
              <button onClick={()=>setPayMethod("alipay")} className={"flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors "+(payMethod==="alipay"?"bg-white text-blue-600 shadow-sm":"text-gray-500")}>Alipay</button>
              <button onClick={()=>setPayMethod("wechat")} className={"flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors "+(payMethod==="wechat"?"bg-white text-green-600 shadow-sm":"text-gray-500")}>WeChat</button>
              <button onClick={()=>{ setPayMethod("card"); payWithCard(); }} className={"flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors "+(payMethod==="card"?"bg-white text-purple-600 shadow-sm":"text-gray-500")}>Card</button>
            </div>

            {/* QR Payment */}
            {(payMethod==="alipay"||payMethod==="wechat") && (
              <div className="mt-4 bg-gray-50 rounded-xl p-4 text-center">
                {modal.method === "auto" && modal.qrCode ? (
                  // XorPay auto QR
                  <>
                    <p className="text-sm font-medium text-gray-700 mb-3">Scan with {payMethod==="alipay"?"Alipay":"WeChat"}</p>
                    <img src={modal.qrCode} alt="QR" className="w-48 h-48 mx-auto rounded-lg" />
                    <p className="text-xs text-gray-400 mt-2">Order: {modal.orderRef}</p>
                    <p className="text-xs text-green-600 mt-1">Auto-confirm on payment</p>
                  </>
                ) : (
                  // Manual QR (your own QR codes)
                  <>
                    <p className="text-sm font-medium text-gray-700 mb-3">Scan to pay <strong>¥{modal.plan?.price}</strong></p>
                    <div className="w-48 h-48 mx-auto bg-white rounded-lg border flex items-center justify-center overflow-hidden">
                      <img src={payMethod==="alipay"?"/alipay-qr.jpg":"/wechat-qr.jpg"} alt="qr" className="w-full h-full object-contain"
                        onError={e=>{(e.target as HTMLImageElement).outerHTML='<div class="text-gray-400 text-xs p-4">Place your QR in<br/>public/'+(payMethod==="alipay"?"alipay-qr.jpg":"wechat-qr.jpg")+'</div>'}} />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Order: {modal.orderRef}</p>
                    <p className="text-xs text-gray-500 mt-3">Pay and click confirm below</p>
                    <button onClick={confirmPaid} className="btn-primary w-full mt-3">I have paid</button>
                  </>
                )}
              </div>
            )}

            {/* Card note */}
            {payMethod==="card" && (
              <div className="mt-4 text-center py-4 text-gray-500 text-sm">
                Opening Lemonsqueezy checkout...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
