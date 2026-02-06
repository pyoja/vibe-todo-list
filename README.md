# Vibe Todo List ✨

> **"복잡함은 덜어내고, 몰입의 즐거움만 남겼습니다."**
>
> Vibe Coding 철학이 담긴, 가장 빠르고 직관적인 투두 리스트 애플리케이션입니다.

## 🌟 주요 기능 (Key Features)

### 1. **Focus & Flow (생산성)**

- **반복 일정 (Recurring Logic)**: 매일, 매주 반복되는 루틴을 자동으로 관리합니다.
- **서브 태스크 (Sub-tasks)**: 복잡한 할 일을 작게 쪼개어 하나씩 정복해 나갈 수 있습니다.
- **태그 시스템 (Tags)**: `#해시태그`로 할 일을 분류하고 필터링하세요.

### 2. **Insights (대시보드)**

- **태그 분석 (Tag Analysis)**: 내가 어디에 집중하고 있는지 데이터로 보여줍니다.

### 3. **Vibe Polish (감성)**

- **사운드 이펙트**: 완료할 때마다 터지는 폭죽과 경쾌한 사운드가 도파민을 자극합니다. 🎵
- **다크 모드**: 눈이 편안한 다크 모드를 완벽 지원합니다. 🌙
- **데이터 백업**: 언제든 내 기록을 JSON으로 내보낼 수 있습니다.

## 🛠️ 기술 스택 (Tech Stack)

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State**: Server Actions + Optimistic UI

## 🚀 시작하기 (Getting Started)

### 1. 프로젝트 복제

```bash
git clone https://github.com/your-username/vibe-todo-list.git
cd vibe-todo-list
```

### 2. 패키지 설치

```bash
npm install
# or
bun install
```

### 3. 환경 변수 설정 (.env)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgresql_connection_string
```

### 4. 실행

```bash
npm run dev
```

## 📝 라이선스

MIT License
