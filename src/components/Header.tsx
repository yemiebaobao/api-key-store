"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Key, LogOut, User, BookOpen } from "lucide-react";

export function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Key className="h-5 w-5 text-blue-600" />
            <span>TokenStore</span>
          </Link>
          <Link href="/usage" className="hidden sm:flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <BookOpen className="h-4 w-4" />
            使用指南
          </Link>
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/usage" className="sm:hidden text-sm text-gray-500 hover:text-gray-800 transition-colors">指南</Link>
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-gray-200" />
          ) : session?.user ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{session.user.name}</span>
              </Link>
              <button onClick={() => signOut()} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">退出</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">登录</Link>
              <Link href="/register" className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">注册</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
