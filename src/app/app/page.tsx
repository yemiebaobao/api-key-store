import { PLANS } from "@/lib/pricing";
import { PurchaseButton } from "../PurchaseButton";
import { Check, Crown, Monitor, Smartphone, Download } from "lucide-react";
import Link from "next/link";

export default function AppPurchasePage() {
  const normal = PLANS.filter(p => !p.isSubscription);
  const vip = PLANS.find(p => p.isSubscription);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Minimal header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-5xl flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-900">AI Assistant <span className="text-xs text-gray-400 font-normal">/ 妗岄潰鐗?/span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">鐧诲綍</Link>
            <Link href="/register" className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">娉ㄥ唽</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm text-blue-700 mb-4">
            <Download className="h-4 w-4" />
            妗岄潰 AI 鍔╂墜 路 涓€閿畨瑁?          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">涓烘闈?App 璐拱 Tokens</h1>
          <p className="mt-3 text-gray-600 max-w-lg mx-auto">
            璐拱鍚庡湪浣犵殑 AI Assistant 妗岄潰绔?Settings 閲岃緭鍏?API Key锛屽嵆鍙В閿佸叏閮ㄥ姛鑳?          </p>
        </div>

        {/* Features highlight */}
        <div className="flex justify-center gap-8 mb-12 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-green-500" />鏀粯瀹?寰俊鏀粯</span>
          <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" />鑷姩鍒拌处</span>
          <span className="flex items-center gap-1.5"><Crown className="h-4 w-4 text-green-500" />鍗充拱鍗崇敤</span>
        </div>

        {/* Plans grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {normal.map((plan) => (
            <div key={plan.id} className={"card flex flex-col p-5 transition-shadow hover:shadow-lg " + (plan.id==="standard"?"ring-2 ring-blue-500 relative":"")}>
              {plan.id==="standard" && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white whitespace-nowrap">鎺ㄨ崘</div>}
              <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-0.5 text-xs text-gray-500">{plan.description}</p>
              <div className="mt-3 flex items-baseline gap-0.5">
                <span className="text-2xl font-bold text-gray-900">楼{plan.price}</span>
                <span className="text-xs text-gray-500">/ 涓€娆?/span>
              </div>
              <p className="text-xs font-medium text-blue-600 mt-0.5">{(plan.tokens/10000).toFixed(0)} 涓?Tokens</p>
              <ul className="mt-3 flex-1 space-y-1.5">
                {plan.features.map(f => <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600"><Check className="h-3 w-3 flex-shrink-0 text-green-500" />{f}</li>)}
              </ul>
              <PurchaseButton planId={plan.id} className="btn-primary mt-4 w-full text-xs py-2.5" />
            </div>
          ))}
        </div>

        {/* VIP */}
        {vip && (
          <div className="flex justify-center">
            <div className="card p-6 max-w-sm ring-2 ring-purple-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-4 py-0.5 text-xs font-semibold text-white whitespace-nowrap">VIP 鏈堝害</div>
              <div className="flex items-center gap-2 justify-center"><Crown className="h-5 w-5 text-yellow-500" /><h3 className="text-lg font-bold text-gray-900">{vip.name}</h3></div>
              <p className="text-center text-xs text-gray-500 mt-1">{vip.description}</p>
              <div className="mt-4 text-center flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-gray-900">楼{vip.price}</span>
                <span className="text-xs text-gray-500">/ 鏈?/span>
              </div>
              <p className="text-center text-xs font-medium text-purple-600 mt-0.5">{(vip.tokens/10000).toFixed(0)} 涓?Tokens / 鏈?/p>
              <ul className="mt-4 space-y-1.5">
                {vip.features.map(f => <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600"><Check className="h-3 w-3 flex-shrink-0 text-green-500" />{f}</li>)}
              </ul>
              <PurchaseButton planId={vip.id} className="btn-primary mt-4 w-full text-xs py-2.5 bg-purple-600 hover:bg-purple-700" />
            </div>
          </div>
        )}

        {/* How to use */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">璐拱鍚庡浣曚娇鐢?/h2>
          <div className="space-y-3">
            {[
              { n: "1", t: "璐拱濂楅", d: "閫夋嫨涓婃柟浠讳竴濂楅瀹屾垚鏀粯" },
              { n: "2", t: "澶嶅埗 API Key", d: "鏀粯鎴愬姛鍚庤繘鍏?Dashboard锛屽鍒朵綘鐨?API Key" },
              { n: "3", t: "绮樿创鍒版闈?App", d: "鎵撳紑 AI Assistant 鈫?鐐归娇杞?鈿欙笍 鈫?杈撳叆 API Key 鈫?淇濆瓨" },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white flex-shrink-0">{s.n}</span>
                <div><p className="font-medium text-gray-900 text-sm">{s.t}</p><p className="text-xs text-gray-500 mt-0.5">{s.d}</p></div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          <Link href="/" className="underline hover:text-gray-600">杩斿洖涓荤珯</Link>
        </p>
      </div>
    </div>
  );
}
