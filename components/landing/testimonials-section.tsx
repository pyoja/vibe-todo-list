"use client";

const reviews = [
  {
    id: "dhz*******",
    text: "매일 아침 '하루조각'을 여는 것으로 하루를 시작합니다. 해야 할 일들이 깔끔하게 정리되어 있어서 업무 효율이 확실히 올랐어요.",
  },
  {
    id: "dwd*******",
    text: "복잡한 건 딱 질색인데, 이건 정말 직관적이에요. 필요한 기능만 쏙쏙 들어있어서 다른 앱들은 다 지웠습니다.",
  },
  {
    id: "yxf*****",
    text: "프리랜서라 일정이 뒤죽박죽이었는데, 타임라인 뷰 덕분에 하루 흐름이 한눈에 보여서 너무 좋아요.",
  },
  {
    id: "izh*****",
    text: "팀원들에게 추천해줬는데 다들 만족해하네요. 군더더기 없는 디자인이라 업무용으로 쓰기에도 딱입니다.",
  },
  {
    id: "tsd******",
    text: "작은 일 하나하나를 '조각'으로 관리한다는 컨셉이 정말 마음에 듭니다. 완료할 때마다 성취감이 커요.",
  },
  {
    id: "hkp*******",
    text: "무료로 이 정도 퀄리티라니... 광고도 없고 깔끔해서 주변에 엄청 영업하고 다닙니다.",
  },
  {
    id: "qkb*******",
    text: "작가라서 떠오르는 아이디어를 바로바로 적어야 하는데, 실행 속도가 빨라서 놓치지 않고 기록할 수 있어요.",
  },
  {
    id: "mbn*****",
    text: "다크 모드 디자인이 너무 예뻐서 쓸 때마다 기분이 좋아집니다. 앱이 아니라 하나의 작품 같아요.",
  },
  {
    id: "mmo******",
    text: "노션은 너무 무거웠는데 이건 정말 가볍네요. 웹에서도 모바일에서도 바로바로 연동돼서 편해요.",
  },
  {
    id: "uuh******",
    text: "습관 만들기 기능이랑 같이 쓰니까 시너지가 좋네요. 하루를 주도적으로 사는 느낌이 듭니다.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32 overflow-hidden border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-[1400px] mx-auto space-y-20 px-4">
        <h2 className="text-3xl font-bold text-center tracking-tight text-zinc-900 dark:text-zinc-100">
          사용자들의 실제 후기
        </h2>

        <div className="relative w-full">
          {/* Scrolling Container */}
          <div
            className="flex gap-8 animate-scroll hover:pause w-max pl-4 items-center"
            style={{ animationDuration: "80s" }}
          >
            {/* Duplicate array for seamless loop */}
            {[...reviews, ...reviews].map((review, idx) => (
              <figure
                key={idx}
                className="w-[350px] flex-shrink-0 group cursor-default p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <blockquote className="text-lg font-medium leading-relaxed mb-6 text-zinc-600 dark:text-zinc-300">
                  &quot;{review.text}&quot;
                </blockquote>
                <figcaption className="flex items-center gap-2 text-sm text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {review.id}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
