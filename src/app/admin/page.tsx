"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCheck } from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [tokens, setTokens] = useState("10000000");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      // Check if this user is the admin
      checkAdmin(session.user?.email || "");
    }
  }, [status]);

  async function checkAdmin(email: string) {
    const res = await fetch("/api/admin/check", { headers: { "x-email": email } });
    const data = await res.json();
    setIsAdmin(data.isAdmin);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/add-credits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, tokens: parseInt(tokens) }) });
      const data = await res.json();
      if (res.ok) { setResult({ type: "success", msg: "OK - Added " + (parseInt(tokens) / 10000).toFixed(0) + "M tokens to " + email }); setEmail(""); }
      else { setResult({ type: "error", msg: data.error || "Failed" }); }
    } catch (e: any) { setResult({ type: "error", msg: e.message }); }
    setLoading(false);
  }

  if (status === "loading" || (status === "authenticated" && !isAdmin)) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  if (status === "authenticated" && isAdmin === false) {
    router.push("/"); return null;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
      <p className="text-sm text-gray-500 mb-8">Logged in as: {session?.user?.email}</p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="buyer@example.com" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tokens</label>
          <div className="flex gap-3">
            <input type="number" value={tokens} onChange={(e) => setTokens(e.target.value)} className="input-field flex-1" min="1" required />
            <button type="submit" disabled={loading} className="btn-primary px-5">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}</button>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            {[
              { label: "1M", val: "1000000" },
              { label: "10M", val: "10000000" },
              { label: "30M", val: "30000000" },
              { label: "80M", val: "80000000" },
            ].map((p) => (
              <button key={p.val} type="button" onClick={() => setTokens(p.val)} className={"text-xs px-3 py-1 rounded-full border transition-colors " + (tokens === p.val ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50")}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {result && (
          <div className={"rounded-lg px-4 py-3 text-sm " + (result.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700")}>
            {result.type === "success" && <CheckCheck className="inline h-4 w-4 mr-1" />}
            {result.msg}
          </div>
        )}
      </form>
    </div>
  );
}