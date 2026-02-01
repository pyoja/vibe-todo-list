# Better-Auth와 Supabase 연동 성공 가이드 & 트러블슈팅

`better-auth`와 Supabase(PostgreSQL) 연동 과정에서 발생한 `Failed to initialize database adapter` 에러를 해결하고, 성공적으로 연결하기 위해 필요한 모든 정보와 과정을 정리한 문서입니다.

## 1. 핵심 요약 (성공 조건)

1.  **연결 모드**: **Direct Connection (Port 5432)** 사용 (Transaction Pooler 6543 사용 불가)
2.  **라이브러리**: `kisely`, `pg` 및 `better-auth` 사용 (Dialect 직접 주입)
3.  **SSL 설정**: Supabase 연결 시 `ssl: { rejectUnauthorized: false }` 필수
4.  **비밀번호**: Supabase 프로젝트 생성 시 설정한 **Database Password** 사용 (특수문자는 URL 인코딩 필수)

---

## 2. 환경 변수 설정 (.env.local)

가장 중요한 것은 `DATABASE_URL`의 구성입니다.

### 2.1 Connection String 구성

Supabase 대시보드 -> **Settings** -> **Database** -> **Connection string** -> **URI** 탭에서 확인 가능합니다.

- **Type**: `URI`
- **Method**: **Direct Connection** (반드시 체크!)
  - Transaction Mode(Port 6543)는 `better-auth` 초기화 시 테이블 스키마 조회 등에서 호환성 문제가 발생할 수 있습니다.
  - **Port**: `5432`

### 2.2 올바른 형식 예시

```env
# 형식: postgresql://[DB_USER]:[DB_PASSWORD]@[DB_HOST]:5432/[DB_NAME]

# 잘못된 예 (Transaction Pooler - Port 6543)
DATABASE_URL="postgresql://postgres.xxx:pass@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

# 올바른 예 (Direct Connection - Port 5432)
DATABASE_URL="postgresql://postgres.xxx:pass@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
```

> **주의**: 비밀번호에 `!`, `@`, `#` 등의 특수문자가 포함된 경우 반드시 **URL Encoding** 해야 합니다.
>
> - 예: `pass!@#` -> `pass%21%40%23`

---

## 3. 필수 라이브러리 설치

`better-auth`가 내부적으로 `kysely`를 사용하지만, 설정을 커스터마이징하고 `pg` 드라이버를 명시적으로 제어하기 위해 다음 패키지들이 필요했습니다.

```bash
npm install better-auth pg kysely
npm install --save-dev @types/pg
```

---

## 4. 코드 구현 (lib/auth.ts)

여러 시도 끝에 성공한 핵심 코드는 **"Kysely Dialect를 수동으로 생성하여 주입하는 방식"**입니다.
`better-auth`에게 `provider: "postgres"` 문자열만 주면 내부적으로 연결을 시도하다가 SSL 설정 누락 등으로 실패합니다.

### 성공 코드 (lib/auth.ts)

```typescript
import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { PostgresDialect } from "kysely";

// 1. pg.Pool을 직접 생성 (SSL 설정 필수)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // 호환성을 위해 false 설정
  },
});

// 2. Kysely Dialect 생성
const dialect = new PostgresDialect({
  pool,
});

export const auth = betterAuth({
  debug: true, // 초기 개발 시 디버깅 켬
  database: {
    // 3. Dialect 직접 주입 (핵심!)
    // provider: "postgres" 대신 사용
    dialect,
    type: "postgres",
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
```

---

## 5. 트러블슈팅 로그 (실패 -> 성공 과정)

### 시도 1: 단순 better-auth 설정 (실패)

- **설정**: `provider: "postgres"`, `pool: new Pool(...)`
- **에러**: `Failed to initialize database adapter`
- **원인**: `better-auth` 내부 초기화 로직이 Supabase 연결의 특수성(SSL 등)을 제대로 처리하지 못했거나, 어댑터 자동 감지에 실패함.

### 시도 2: DB 연결 테스트 스크립트 작성 (성공 확인)

- **조치**: `pg` 라이브러리로만 구성된 `test-db.mjs` 실행.
- **오 시행착오**:
  1. 비밀번호 오류 (`password authentication failed`) -> 올바른 PW로 수정.
  2. 호스트 주소 오류 (`ENOTFOUND`) -> Supabase Pooler 주소 오타 수정 (`aws-1` vs `aws-0`).
  3. 포트 문제 (Port 6543) -> `Tenant not found` 등의 에러 발생 가능성 -> **Port 5432**로 변경하여 연결 성공 확인.
- **교훈**: DB 정보 자체는 Port 5432 + SSL + 올바른 PW라면 문제없음.

### 시도 3: Kysely Dialect 직접 주입 (최종 성공)

- **조치**: `better-auth`의 자동 연결 기능을 끄고, 이미 검증된 `pg` Pool을 `Kysely`에 태워서 통째로 주입.
- **결과**: **성공**. `initializing` 에러 없이 정상 구동.

---

## 6. 결론

Supabase와 `better-auth`를 연동할 때는 **자동 설정에 의존하지 말고**, `pg`와 `kysely`를 이용해 **명시적으로 연결 객체(Dialect)를 만들어 주입**하는 것이 가장 확실한 방법입니다.

1. **포트**: 5432
2. **비밀번호**: URL 인코딩 필수
3. **코드**: `PostgresDialect` 수동 생성 및 주입
