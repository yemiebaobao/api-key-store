import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutLink, getPlanById } from "@/lib/lemonsqueezy";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { planId } = await req.json();
    const plan = getPlanById(planId);
    if (!plan) return NextResponse.json({ error: "无效的套餐" }, { status: 400 });

    const url = await createCheckoutLink({
      email: session.user.email,
      userId: (session.user as any).id,
      planId,
    });

    return NextResponse.json({ url });
  } catch (e: any) {
    console.error("Checkout error:", e);
    return NextResponse.json({ error: "创建订单失败: " + (e.message || "未知错误") }, { status: 500 });
  }
}