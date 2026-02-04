"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name: "김**",
    role: "마케터",
    content:
      "평소 쓰던 플래너가 너무 복잡해서 몇 번 쓰다 포기했는데, 하루조각은 정말 필요한 기능만 있어서 꾸준히 쓰게 돼요.",
    avatar: "MJ",
  },
  {
    name: "이**",
    role: "프론트엔드 개발자",
    content:
      "일정을 체크박스로 지워나가는 쾌감이 남다릅니다. 퇴근할 때 ‘오늘도 잘 살았다’는 성취감이 들게 해주는 앱이에요.",
    avatar: "JH",
  },
  {
    name: "박**",
    role: "스타트업 CEO",
    content:
      "아침 3분이면 하루 계획이 끝납니다. 복잡한 설정 없이 바로 시작할 수 있다는 점이 가장 큰 장점이네요.",
    avatar: "SH",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-white dark:bg-black w-full">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            이미 많은 분들이 하루를 조각내고 있습니다
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            복잡함에 지친 분들의 솔직한 이야기를 들어보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <Card
              key={i}
              className="border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 shadow-sm hover:shadow-md transition-shadow"
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
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed min-h-[80px]">
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
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.role}
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
