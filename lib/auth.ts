import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { PostgresDialect } from "kysely";

// by jh 20260126: SSL 설정을 포함한 Pool 인스턴스 생성 (Supabase 연결 필수)
console.log("Initializing Postgres Pool (Kysely Dialect)...");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  console.log("DATABASE_URL length:", process.env.DATABASE_URL.length);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// by jh 20260126: better-auth 내부 Kysely 인스턴스를 위한 dialect 직접 생성
const dialect = new PostgresDialect({
  pool,
});

// by jh 20260202: Vercel 배포 환경 대응을 위한 baseURL 동적 설정
const baseURL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

// by jh 20260121: better-auth 설정 및 Supabase(Postgres) 어댑터 연결
export const auth = betterAuth({
  baseURL,
  debug: true, // 에러 디버깅을 위해 추가
  database: {
    dialect, // adapter/provider 대신 dialect 직접 주입
    type: "postgres", // 명시적 타입 지정
  },
  // by jh 20260126: 소셜 로그인 설정 (Google)
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
