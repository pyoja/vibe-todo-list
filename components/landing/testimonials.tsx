"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  content: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name: "dhz*******",
    content:
      "일하는 도중 틈틈이 기록하기 너무 좋아요. 복잡하지 않아서 계속 쓰게 되네요.",
    avatar: "DH",
  },
  {
    name: "dwd*******",
    content:
      "여러 투두 앱을 써봤지만 결국 하루조각으로 정착했습니다. 직관적인 게 최고예요.",
    avatar: "DW",
  },
  {
    name: "yxf*****",
    content:
      "심플하지만 필요한 기능은 다 있어요. 특히 폴더 기능이 업무 정리에 큰 도움이 됩니다.",
    avatar: "YX",
  },
  {
    name: "izh*****",
    content:
      "디자인이 깔끔해서 볼 때마다 기분이 좋아져요. 다크모드도 완벽합니다.",
    avatar: "IZ",
  },
  {
    name: "tsd******",
    content:
      "시험 기간 계획 세울 때 유용하게 쓰고 있어요. 할 일 체크하는 맛이 납니다!",
    avatar: "TS",
  },
  {
    name: "hkp*******",
    content:
      "아이디어가 떠오를 때 바로바로 메모하고 정리할 수 있어서 생산성이 올라갔어요.",
    avatar: "HK",
  },
  {
    name: "qkb*******",
    content:
      "장보기 목록이나 집안일 정리할 때 너무 편해요. 남편한테도 추천했습니다.",
    avatar: "QK",
  },
  {
    name: "mbn*****",
    content:
      "사용성이 정말 편합니다. 불필요한 기능 없이 딱 필요한 것만 있어서 좋네요.",
    avatar: "MB",
  },
  {
    name: "mmo******",
    content: "하루의 흐름을 한눈에 볼 수 있어서 작업 스케줄 관리가 쉬워졌어요.",
    avatar: "MM",
  },
  {
    name: "uuh******",
    content: "모바일이랑 PC 동기화가 빨라서 어디서든 확인하기 좋습니다.",
    avatar: "UU",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-white dark:bg-black w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            이미 많은 분들이 하루를 조각내고 있습니다
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            복잡함에 지친 분들의 솔직한 이야기를 들어보세요.
          </p>
        </div>
      </div>

      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-black to-transparent z-10 pointer-events-none" />

        <div className="flex gap-6 animate-scroll hover:pause w-max pl-4">
          {[...testimonials, ...testimonials].map((item, i) => (
            <Card
              key={i}
              className="w-[300px] flex-shrink-0 border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6 space-y-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed min-h-[80px] break-keep">
                  &quot;{item.content}&quot;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
                  <Avatar className="h-10 w-10 border border-slate-200 dark:border-zinc-700">
                    <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs font-bold">
                      {item.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
