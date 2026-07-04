import { NextRequest } from "next/server";
import { execFileSync } from "child_process";
import { join } from "path";

const FEMALE_VOICE = "zh-CN-XiaoxiaoNeural";
const MALE_VOICE = "zh-CN-YunxiNeural";

export async function POST(req: NextRequest) {
  let body;
  try { body = await req.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }

  const text = body.text?.trim();
  if (!text) return new Response("Missing text", { status: 400 });

  const voice = body.voice === "male" ? MALE_VOICE : FEMALE_VOICE;
  const scriptPath = join(process.cwd(), "scripts", "tts.js");

  try {
    const buf = execFileSync("node", [scriptPath, voice], {
      input: text,
      timeout: 60000,
      cwd: process.cwd(),
      shell: false,
    });
    return new Response(buf, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
