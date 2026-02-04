"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Share, SquarePlus } from "lucide-react";
import Image from "next/image";

interface IOSInstallGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IOSInstallGuide({ open, onOpenChange }: IOSInstallGuideProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[20px] px-6 pb-8 pt-6">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="text-xl font-bold">
            홈 화면에 앱 추가하기
          </SheetTitle>
          <SheetDescription>
            앱 스토어 방문 없이, 사파리 브라우저에서 바로 설치할 수 있습니다.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <Share className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-foreground">
                1. 공유 버튼 누르기
              </h3>
              <p className="text-sm text-muted-foreground">
                화면 하단 메뉴바에 있는{" "}
                <span className="text-blue-500 font-medium">공유</span> 아이콘을
                눌러주세요.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <SquarePlus className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-foreground">
                2. '홈 화면에 추가' 선택하기
              </h3>
              <p className="text-sm text-muted-foreground">
                메뉴를 아래로 스크롤하여{" "}
                <span className="font-medium">홈 화면에 추가</span>를 찾아
                선택하세요.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative arrow or hint if needed */}
        <div className="mt-8 flex justify-center opacity-50">
          <span className="text-xs text-muted-foreground">
            Daypiece를 설치하면 더 편리하게 사용할 수 있습니다.
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
