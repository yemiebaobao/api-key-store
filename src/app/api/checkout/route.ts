import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutLink } from "@/lib/lemonsqueezy";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const checkoutUrl = await createCheckoutLink({
      email: session.user.email,
      userId: (session.user as any).id,
    });
    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message || "创建订单失败" }, { status: 500 });
  }
}