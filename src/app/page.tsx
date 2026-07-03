import { PLANS } from "@/lib/pricing";
import { PurchaseButton } from "./PurchaseButton";
import { Check, Crown } from "lucide-react";

export default function HomePage() {
  const normal = PLANS.filter(p => !p.isSubscription);
  const vip = PLANS.find(p => p.isSubscription);
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">AI API 棰濆害</h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-gray-600">鍏煎 OpenAI 鏍煎紡锛屾寜閲忎粯璐癸紝姘镐笉杩囨湡</p>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-6">涓€娆℃€ц喘涔?/h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
        {normal.map((plan) => (
          <div key={plan.id} className={"card flex flex-col p-6 transition-shadow hover:shadow-lg " + (plan.id==="standard"?"ring-2 ring-blue-500":"")}>
            {plan.id==="standard" && <div className="-mt-8 mb-4 text-center"><span className="rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">鎺ㄨ崘</span></div>}
            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">楼{plan.price}</span>
              <span className="text-sm text-gray-500">/ 涓€娆?/span>
            </div>
            <p className="mt-1 text-sm font-medium text-blue-600">{(plan.tokens/10000).toFixed(0)} 涓?Tokens</p>
            <ul className="mt-4 flex-1 space-y-2">
              {plan.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-gray-600"><Check className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />{f}</li>)}
            </ul>
            <PurchaseButton planId={plan.id} className="btn-primary mt-6 w-full text-sm" />
          </div>
        ))}
      </div>

      {vip && (
        <>
        <h2 className="text-xl font-bold text-gray-800 mb-6">鏈堝害璁㈤槄</h2>
        <div className="flex justify-center">
          <div className="card p-8 max-w-sm ring-2 ring-purple-500">
            <div className="-mt-12 mb-4 text-center"><span className="rounded-full bg-purple-600 px-5 py-1.5 text-sm font-semibold text-white">VIP 鏈堝害</span></div>
            <div className="flex items-center gap-2 justify-center"><Crown className="h-6 w-6 text-yellow-500" /><h3 className="text-xl font-bold text-gray-900">{vip.name}</h3></div>
            <p className="mt-2 text-center text-sm text-gray-500">{vip.description}</p>
            <div className="mt-6 text-center flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-gray-900">楼{vip.price}</span>
              <span className="text-sm text-gray-500">/ 鏈?/span>
            </div>
            <p className="mt-1 text-center text-sm font-medium text-purple-600">{(vip.tokens/10000).toFixed(0)} 涓?Tokens</p>
            <ul className="mt-6 space-y-3">
              {vip.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-gray-600"><Check className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />{f}</li>)}
            </ul>
            <PurchaseButton planId={vip.id} className="btn-primary mt-6 w-full text-sm bg-purple-600 hover:bg-purple-700" />
          </div>
        </div>
        </>
      )}
    </div>
  );
}
