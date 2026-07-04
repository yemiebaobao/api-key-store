 import { NextRequest } from "next/server";
 import { execSync } from "child_process";
 
 export async function POST(req: NextRequest) {
   let body;
   try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 }); }
 
   const command = body.command?.trim();
   if (!command) return new Response(JSON.stringify({ error: "Missing command" }), { status: 400 });
 
   try {
     const output = execSync(command, {
       timeout: 30000,
       maxBuffer: 100 * 1024,
       shell: "powershell.exe",
       encoding: "utf8",
       windowsHide: true,
     });
     return new Response(JSON.stringify({
       success: true,
       output: output || "(no output)",
       truncated: output.length >= 100 * 1024,
     }), { status: 200, headers: { "Content-Type": "application/json" } });
   } catch (e: any) {
     return new Response(JSON.stringify({
       success: false,
       output: e.stdout || "",
       error: e.stderr || e.message,
       code: e.status || 1,
     }), { status: 200, headers: { "Content-Type": "application/json" } });
   }
 }
