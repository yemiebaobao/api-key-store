"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";

export function PurchaseButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    if (!session) { router.push("/login"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { alert(data.error || "创建订单失败"); setLoading(false); }
    } catch { alert("网络错误"); setLoading(false); }
  }

  return (
    <button onClick={handleBuy} disabled={loading} className="btn-primary mt-8 w-full">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <><ShoppingCart className="mr-2 h-4 w-4" />立即购买</>
      )}
    </button>
  );
}