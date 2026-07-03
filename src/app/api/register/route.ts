import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createUser, getUserByEmail } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();
    if (!email || !password || !name) return NextResponse.json({ error: "All fields required" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password too short" }, { status: 400 });
    const existing = await getUserByEmail(email);
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const hashedPassword = await bcrypt.hash(password, 12);
    await createUser({ id: crypto.randomUUID(), email, name, password: hashedPassword, created_at: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Registration failed: " + e.message }, { status: 500 });
  }
}