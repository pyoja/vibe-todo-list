import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// by jh 20260121: better-auth API 핸들러 노출
export const { GET, POST } = toNextJsHandler(auth);
