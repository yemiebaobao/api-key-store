import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.FREE_TIER_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? process.env.NEXT_PUBLIC_APP_URL + "/api/v1"
    : "https://api-key-store.vercel.app/api/v1";
  
  return NextResponse.json({
    apiKey: apiKey || null,
    baseUrl,
    hasFreeTier: !!apiKey,
    message: apiKey ? "Free tier is available for basic chat" : "Free tier not configured",
  });
}