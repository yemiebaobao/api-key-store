import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }
        const user = await getUserByEmail(credentials.email);
        if (!user) throw new Error("邮箱或密码错误");
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("邮箱或密码错误");
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) { if (user) (token as any).id = user.id; return token; },
    async session({ session, token }) { if (session.user) (session.user as any).id = token.id; return session; },
  },
  secret: process.env.NEXTAUTH_SECRET,
};