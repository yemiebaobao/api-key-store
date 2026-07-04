 import { NextRequest } from "next/server";
 import bcrypt from "bcryptjs";
 import { getUserByEmail } from "@/lib/db";
 
 export async function POST(req: NextRequest) {
   let body;
   try { body = await req.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
 
   const { email, password } = body;
   if (!email || !password) return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400 });
 
   try {
     const user = await getUserByEmail(email);
     if (!user) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
 
     const isValid = await bcrypt.compare(password, user.password);
     if (!isValid) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
 
     const adminEmail = process.env.ADMIN_EMAIL || "admin@localhost";
     const isAdmin = user.email === adminEmail;
 
     return new Response(JSON.stringify({
       success: true,
       user: { id: user.id, email: user.email, name: user.name },
       isAdmin,
     }), {
       status: 200,
       headers: { "Content-Type": "application/json" },
     });
   } catch (e: any) {
     return new Response(JSON.stringify({ error: e.message }), { status: 500 });
   }
 }
