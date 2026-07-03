import { PLANS } from "@/lib/lemonsqueezy";
import { PurchaseButton } from "./PurchaseButton";
import { Check } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">AI API Credits</h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-gray-600">OpenAI-compatible API proxy. Pay-as-you-go, no expiry.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const best = plan.id === "standard";
          return (
            <div key={plan.id} className={"card flex flex-col p-6 transition-shadow hover:shadow-lg " + (best ? "ring-2 ring-blue-500" : "")}>
              {best && <div className="-mt-8 mb-4 text-center"><span className="rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">BEST SELLER</span></div>}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-sm text-gray-500">/ once</span>
              </div>
              <p className="mt-1 text-sm font-medium text-blue-600">{(plan.tokens / 10000).toFixed(0)}M Tokens</p>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />{f}
                  </li>
                ))}
              </ul>
              <PurchaseButton planId={plan.id} className="btn-primary mt-6 w-full text-sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
}