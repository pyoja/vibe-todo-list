import { createAuthClient } from "better-auth/react";

// by jh 20260126: better-auth 클라이언트 인스턴스 생성
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL, // 선택 사항, 명시적으로 설정하면 좋음
});

export const { signIn, signUp, useSession, signOut } = authClient;
