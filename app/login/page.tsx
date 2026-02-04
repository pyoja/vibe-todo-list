"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            다시 오신 것을 환영합니다
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            계속하려면 로그인이 필요합니다
          </p>
        </div>

        {/* Login Form */}
        <div className="grid gap-4">
          <Button
            variant="outline"
            className="w-full h-12 text-base font-medium rounded-xl border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 relative"
            onClick={async () => {
              await authClient.signIn.social({
                provider: "google",
                callbackURL: "/",
              });
            }}
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google로 계속하기
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-black px-2 text-slate-500">
                또는
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          >
            게스트로 둘러보기
          </Button>
        </div>

        <p className="px-8 text-center text-sm text-slate-500 dark:text-slate-400">
          계속 진행시 Vibe Todo의 <br />
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-slate-900 dark:hover:text-slate-100"
          >
            이용약관
          </Link>{" "}
          및{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-slate-900 dark:hover:text-slate-100"
          >
            개인정보처리방침
          </Link>
          에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
