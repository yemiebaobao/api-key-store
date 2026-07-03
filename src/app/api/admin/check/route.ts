import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "yemiebaobao@outlook.com";

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.email === ADMIN_EMAIL;
  return NextResponse.json({ isAdmin });
}