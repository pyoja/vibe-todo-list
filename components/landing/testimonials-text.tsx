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
  {
    id: "avd******",
    text: "처음엔 너무 단순한가 싶었는데, 쓰다 보니 오히려 그래서 더 집중이 잘 돼요. 본질에 충실한 앱입니다.",
  },
  {
    id: "pgc*****",
    text: "일주일 동안 써봤는데 벌써 없으면 불안할 정도예요. 제 뇌를 외주 맡긴 기분이랄까요? ㅋㅋ",
  },
  {
    id: "byx*******",
    text: "할 일 미루는 습관이 심했는데, '오늘 할 일'에만 집중하게 해주니까 부담이 덜해서 실행력이 늘었어요.",
  },
  {
    id: "vfx******",
    text: "대학생 과제 챙기기에 이만한 게 없습니다. 마감일 알림도 유용하고, 카테고리 분류도 편해요.",
  },
  {
    id: "taw*******",
    text: "일본어 공부 계획 세울 때 쓰고 있어요. 매일 조금씩 달성해가는 과정이 눈에 보이니까 포기하지 않게 되네요.",
  },
  {
    id: "sdn*******",
    text: "투두 리스트 유목민이었는데 드디어 정착했습니다. 개발자님, 평생 업데이트 해주세요! 제발요!",
  },
  {
    id: "qmk*****",
    text: "미용실 예약 관리용으로 쓰고 있는데, 모바일에서도 보기 편해서 일하면서 틈틈이 확인하기 좋아요.",
  },
  {
    id: "eod******",
    text: "계획 짤 때마다 스트레스였는데, 이제는 즐거움이 됐어요. UI가 예쁘니까 자꾸 들어와서 보게 되네요.",
  },
  {
    id: "zdh******",
    text: "심플하지만 강력합니다. 태그 기능이랑 검색 기능도 빠르고 정확해서 옛날 기록 찾기도 쉬워요.",
  },
  {
    id: "ovk*****",
    text: "주말에 몰아서 하던 집안일을 평일에 조금씩 나눠서 하게 됐어요. 삶의 질이 수직 상승했습니다.",
  },
  {
    id: "fhc*******",
    text: "친구 추천으로 써봤는데, 왜 진작 안 썼나 싶어요. 머릿속이 복잡할 때 일단 여기에 털어놓으면 안심이 됩니다.",
  },
  {
    id: "mxp******",
    text: "단순함의 미학을 제대로 보여주는 서비스네요. 복잡한 세상에 이런 쉼터 같은 도구가 있어서 감사합니다.",
  },
];

export function TestimonialsText() {
  return (
    <section className="py-24 sm:py-32 bg-zinc-950 text-white overflow-hidden border-t border-zinc-900">
      <div className="max-w-[1400px] mx-auto space-y-20">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest text-center mb-12">
          From Users
        </h2>

        <div className="relative w-full">
          {/* Scrolling Container */}
          <div
            className="flex gap-12 sm:gap-24 animate-scroll hover:pause w-max pl-4 items-center"
            style={{ animationDuration: "100s" }}
          >
            {/* Duplicate array for seamless loop */}
            {[...reviews, ...reviews].map((review, idx) => (
              <figure
                key={idx}
                className="w-[300px] sm:w-[450px] flex-shrink-0 group cursor-default"
              >
                <div className="border-l-2 border-zinc-800 pl-6 sm:pl-8 group-hover:border-blue-500 transition-colors duration-300">
                  <blockquote className="text-lg sm:text-2xl font-bold leading-relaxed mb-4 sm:mb-6 text-zinc-300 group-hover:text-white transition-colors">
                    &quot;{review.text}&quot;
                  </blockquote>
                  <figcaption className="flex items-center gap-2 text-sm text-zinc-500">
                    <span className="font-semibold text-white">
                      {review.id}
                    </span>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
