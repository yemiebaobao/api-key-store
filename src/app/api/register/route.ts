import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createUser, getUserByEmail } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();
    if (!email || !password || !name) return NextResponse.json({ error: "请填写所有字段" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
    const existing = await getUserByEmail(email);
    if (existing) return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 });
    const hashedPassword = await bcrypt.hash(password, 12);
    await createUser({ id: crypto.randomUUID(), email, name, password: hashedPassword, created_at: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}