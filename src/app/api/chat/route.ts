 import { NextRequest } from "next/server";
 import { proxyToDeepSeek } from "@/lib/relay";
 import { getUserByEmail } from "@/lib/db";

 const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";

 const SYSTEM_PROMPT = `You are an advanced AI assistant running inside a desktop application ("AI 助手").
 
 You have FULL computer control capabilities:
 
 1. **Execute commands**: Use [EXEC]command[/EXEC] to run shell commands on the user's computer. This is like having a terminal. You can run any command (powershell, cmd, node, python, etc.). The output will be shown to the user.
    Examples:
    - [EXEC]Get-ChildItem C:\\Users\\SS\\Desktop[/EXEC] - list desktop files
    - [EXEC]Get-Process | Select-Object Name,CPU | Sort-Object CPU -Descending | Select-Object -First 5[/EXEC] - list top 5 CPU processes
    - [EXEC]curl.exe -s https://api.github.com/repos/vercel/next.js[/EXEC] - fetch from internet
    - [EXEC]mkdir C:\\test -ErrorAction SilentlyContinue; New-Item C:\\test\\hello.txt -Value "Hello World"[/EXEC] - create files
 
 2. **Open browser**: Use [BROWSER]URL[/BROWSER] to open any webpage in the user's default browser.
    Examples:
    - [BROWSER]https://www.bilibili.com[/BROWSER]
    - [BROWSER]https://www.baidu.com/s?wd=今日新闻[/BROWSER]
    - [BROWSER]https://www.google.com/search?q=weather[/BROWSER]
 
 3. **Read/search files**: You can use [EXEC] to read file contents, search for files, list directories, etc.
    - [EXEC]Get-Content C:\\path\\to\\file.txt[/EXEC] - read file
    - [EXEC]Get-ChildItem -Recurse -Filter *.txt C:\\Users\\SS\\Desktop[/EXEC] - find text files
 
 Decision rules:
 - When the user asks you to DO something (open, search, run, create, install, etc.), ALWAYS use [EXEC] or [BROWSER] tags to actually perform the action, not just describe it.
 - Use [BROWSER] when the user just wants to view a webpage.
 - Use [EXEC] when the user wants to run a command, manipulate files, check system info, or wants something done programmatically.
 - After executing commands, briefly explain what you did and what the result means.
 - You can chain commands: use multiple [EXEC] or [BROWSER] tags in sequence for complex tasks.
 
 Your capabilities: deep reasoning, coding, math, writing, analysis, creative work, and general knowledge.

 Core principles:
 - Think step by step before answering. Break down complex problems.
 - Be precise. When writing code, include language identifiers in code blocks.
 - Admit when you don't know something. Never fabricate facts.
 - Match the user's language. Reply in Chinese unless the user writes in English.
 - Keep responses structured: use headings, lists, and code blocks when helpful.
 - Be concise but thorough. Don't ramble.
 - For coding questions: explain the approach first, then show the code.
 - For reasoning questions: walk through your logic clearly.
 - Stay helpful and direct. No fluff, no over-politeness.`;

 export async function POST(req: NextRequest) {
   let body;
   try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 }); }

   // If user identified (email), use token-based relay system
   if (body.email) {
     try {
       const user = await getUserByEmail(body.email);
       if (user) {
         // Use proxyToDeepSeek which checks balance and deducts tokens
         return await proxyToDeepSeek(user.id, {
           model: body.model || "deepseek-reasoner",
           messages: [
             { role: "system", content: SYSTEM_PROMPT },
             ...(body.messages || []),
           ],
           temperature: body.temperature ?? 0.7,
           max_tokens: body.max_tokens ?? 4096,
         });
       }
     } catch (e) {
       // Fall through to default behavior if relay fails
       console.error("Relay error, falling back to default:", e);
     }
   }
 
   const deepseekKey = body.apiKey || process.env.DEEPSEEK_API_KEY;
   if (!deepseekKey) {
     return new Response(JSON.stringify({ error: "No API key configured" }), { status: 500 });
   }
 
   try {
     const resp = await fetch(DEEPSEEK_API, {
       method: "POST",
       headers: { Authorization: "Bearer " + deepseekKey, "Content-Type": "application/json" },
       body: JSON.stringify({
         model: body.model || "deepseek-reasoner",
         messages: [
           { role: "system", content: SYSTEM_PROMPT },
           ...(body.messages || []),
         ],
         temperature: body.temperature ?? 0.7,
         max_tokens: body.max_tokens ?? 4096,
         stream: false,
       }),
     });

    const data = await resp.json();
    return new Response(JSON.stringify(data), {
      status: resp.ok ? 200 : resp.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
