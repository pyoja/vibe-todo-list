"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export function InAppBrowserGuard() {
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    // Common in-app browsers: KakaoTalk, Instagram, Naver, Facebook, Line
    const isInApp = /kakaotalk|instagram|naver|snapchat|line|everytime/i.test(
      userAgent,
    );

    if (isInApp) {
      if (/android/i.test(userAgent)) {
        // Android: Try to force open in Chrome via Intent scheme
        // Remove protocol for intent scheme
        const url = window.location.href.replace(/^https?:\/\//i, "");
        const intent = `intent://${url}#Intent;scheme=https;package=com.android.chrome;end`;

        window.location.href = intent;
      } else {
        // iOS/Other: Cannot force open Safari easily. Show strong guidance.
        toast.error("Google 로그인은 인앱 브라우저를 지원하지 않습니다.", {
          duration: Infinity, // Keep it open
          description: (
            <div className="flex flex-col gap-2 mt-2">
              <p>
                오른쪽 하단(또는 상단)의{" "}
                <span className="font-bold">⋮ 메뉴</span>를 눌러 <br />
                <span className="font-bold text-blue-500">
                  &apos;다른 브라우저로 열기&apos;
                </span>
                를 선택해주세요.
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success(
                    "링크가 복사되었습니다. 사파리나 크롬에 붙여넣어주세요.",
                  );
                }}
                className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-zinc-800 p-2 rounded-md hover:bg-slate-200 transition-colors w-fit"
              >
                <Copy className="w-3 h-3" />
                링크 복사하기
              </button>
            </div>
          ),
        });
      }
    }
  }, []);

  return null;
}
