"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Key, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "注册失败"); setLoading(false); return; }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.ok) { router.push("/dashboard"); router.refresh(); }
    } catch { setError("网络错误"); setLoading(false); }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center px-4">
      <div className="w-full">
        <div className="mb-8 text-center">
          <Key className="mx-auto h-10 w-10 text-blue-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">创建账户</h1>
          <p className="mt-2 text-sm text-gray-600">注册 TokenStore 开始购买</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-5 p-8">
          {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">昵称</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="你的名称" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="至少 6 位" minLength={6} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "注册"}
          </button>
          <p className="text-center text-sm text-gray-600">
            已有账户？<Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">立即登录</Link>
          </p>
        </form>
      </div>
    </div>
  );
}