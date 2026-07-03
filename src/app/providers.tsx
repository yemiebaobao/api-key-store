"use client";

import { SessionProvider } from "next-auth/react";
import { Header } from "@/components/Header";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Header />
      <main className="min-h-[calc(100vh-64px)]">{children}</main>
    </SessionProvider>
  );
}
