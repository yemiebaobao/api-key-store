import { PRODUCT } from "@/lib/lemonsqueezy";
import { PurchaseButton } from "./PurchaseButton";
import { Check } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center px-4">
      <div className="w-full text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
          立即购买，即买即用
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          购买 API Key
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-gray-600">
          {PRODUCT.description}
        </p>

        <div className="card mx-auto mt-10 max-w-sm p-8 text-left">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">
              ${PRODUCT.price}
            </span>
            <span className="text-sm text-gray-500">/ 一次购买</span>
          </div>

          <p className="mt-2 text-sm text-gray-600">{PRODUCT.name}</p>

          <ul className="mt-6 space-y-3">
            {PRODUCT.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                {f}
              </li>
            ))}
          </ul>

          <PurchaseButton />
        </div>

        <p className="mt-6 text-xs text-gray-400">
          支付由 Lemon Squeezy 安全处理，无需担心信息泄露
        </p>
      </div>
    </div>
  );
}