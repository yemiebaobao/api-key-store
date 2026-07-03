"use client";

import { Copy, CheckCheck } from "lucide-react";
import { useState } from "react";

export default function UsagePage() {
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [id]: false })), 2000);
  }

  const code = (text: string, id: string) => (
    <div className="relative rounded-lg bg-gray-900 p-4 pr-12 text-sm text-green-400 overflow-x-auto font-mono whitespace-pre">
      {text}
      <button onClick={() => copyText(text, id)} className="absolute right-2 top-2 rounded p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 transition-colors">
        {copied[id] ? <CheckCheck className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">使用指南</h1>
        <p className="mt-2 text-gray-600">购买 API Key 后，按照以下步骤快速接入</p>
      </div>

      {/* Step 1 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">1</span>
          购买额度
        </h2>
        <p className="mt-3 text-gray-600">在首页选择一个套餐，完成支付。购买后自动获得 API Key 和对应额度。</p>
      </section>

      {/* Step 2 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">2</span>
          获取你的 API Key
        </h2>
        <p className="mt-3 text-gray-600">登录后进入 <strong>控制台</strong>，复制你的专属 API Key（以 <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">sk_</code> 开头）。</p>
      </section>

      {/* Step 3 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">3</span>
          调用 API
        </h2>
        <p className="mt-3 text-gray-600">我们的 API 完全兼容 OpenAI 格式，只需修改 <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">base_url</code> 即可无缝切换。</p>

        <h3 className="mt-6 font-semibold text-gray-900">Python（使用 openai 库）</h3>
        <div className="mt-2">{code(`from openai import OpenAI

client = OpenAI(
    api_key="sk-你的APIKey",
    base_url="https://你的域名.vercel.app/api/v1"
)

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "你好，请介绍一下你自己"}]
)
print(response.choices[0].message.content)`, "python")}</div>

        <h3 className="mt-6 font-semibold text-gray-900">Node.js</h3>
        <div className="mt-2">{code(`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-你的APIKey",
  baseURL: "https://你的域名.vercel.app/api/v1",
});

const response = await client.chat.completions.create({
  model: "deepseek-chat",
  messages: [{ role: "user", content: "你好" }],
});
console.log(response.choices[0].message.content);`, "nodejs")}</div>

        <h3 className="mt-6 font-semibold text-gray-900">curl 命令行</h3>
        <div className="mt-2">{code(`curl https://你的域名.vercel.app/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-你的APIKey" \\
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "你好"}]
  }'`, "curl")}</div>
      </section>

      {/* Step 4 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">4</span>
          查看余额 &amp; 用量
        </h2>
        <p className="mt-3 text-gray-600">登录后进入 <strong>控制台</strong>，可以随时查看剩余额度和调用记录。</p>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">常见问题</h2>
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900">支持哪些模型？</h3>
            <p className="mt-1 text-sm text-gray-600">目前支持 deepseek-chat（DeepSeek V3）和 deepseek-reasoner（DeepSeek R1），在请求的 model 参数中指定即可。</p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900">额度用完了怎么办？</h3>
            <p className="mt-1 text-sm text-gray-600">去首页购买新套餐，额度自动叠加到你的账户余额上，无需更换 API Key。</p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900">额度会过期吗？</h3>
            <p className="mt-1 text-sm text-gray-600">永不过期，买多少用多少，直到用完为止。</p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900">支持流式输出（Stream）吗？</h3>
            <p className="mt-1 text-sm text-gray-600">目前仅支持非流式输出。如果你想使用流式，需要升级到最新的 OpenAI 库版本。</p>
          </div>
        </div>
      </section>
    </div>
  );
}
