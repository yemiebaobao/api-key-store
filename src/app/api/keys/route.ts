import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAssignedKeysByUserId } from "@/lib/db";

// 涔板鏌ョ湅鑷繁涔板埌鐨勬墍鏈?API Key
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "璇峰厛鐧诲綍" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const keys = await getAssignedKeysByUserId(userId);

  return NextResponse.json({ keys });
}

