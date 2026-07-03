import { NextResponse } from "next/server";
import { getAvailableKeyCount, importKeysToPool } from "@/lib/db";

const ADMIN_SECRET = process.env.ADMIN_SEED_SECRET ?? "change-me";

function isAuthorized(req: Request) {
  return req.headers.get("x-admin-secret") === ADMIN_SECRET;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const count = await getAvailableKeyCount();
  return NextResponse.json({ availableKeys: count });
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  try {
    const { keys } = await req.json();
    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: "请提供 Key 数组" }, { status: 400 });
    }
    const before = await getAvailableKeyCount();
    await importKeysToPool(keys);
    const after = await getAvailableKeyCount();
    return NextResponse.json({ imported: after - before, totalAvailable: after });
  } catch {
    return NextResponse.json({ error: "导入失败" }, { status: 500 });
  }
}