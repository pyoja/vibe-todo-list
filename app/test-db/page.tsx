import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

export default async function TestDbPage() {
  const supabase = await createClient();

  let isConnected = false;
  let message = "";
  let detail = "";

  // 환경변수 누락 체크
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    isConnected = false;
    message = "환경변수가 설정되지 않았습니다 (.env.local 확인 필요)";
  } else {
    try {
      // 존재하지 않을 법한 테이블을 조회하여 DB 도달 여부 확인
      // 테이블이 없다는 에러(42P01)가 돌아오면 연결은 된 것임
      const { error } = await supabase
        .from("__connection_test__")
        .select("*")
        .limit(1);

      if (!error) {
        // 에러가 없으면 연결 성공 (테이블이 우연히 존재함)
        isConnected = true;
      } else {
        // 에러가 발생했으나 DB 응답인 경우
        // 42P01: undefined_table (Postgres) -> 연결 성공
        // code가 존재하면 DB로부터의 응답임 (네트워크/인증 오류는 code가 없거나 다름)
        // 단, 401 Invalid API Key는 code가 'PGRST301'이 아닐 수 있음.

        if (
          error.code === "42P01" ||
          (error.code && error.code.startsWith("PGRST"))
        ) {
          isConnected = true;
        } else if (error.message && error.message.includes("Invalid API Key")) {
          isConnected = false;
          message = "유효하지 않은 API Key입니다.";
        } else {
          // 그 외 (네트워크 오류 등)
          isConnected = false;
          message = error.message;
          detail = error.code || "";
        }
      }
    } catch (e: unknown) {
      isConnected = false;
      message = "연결 시도 중 예외 발생";
      detail = e instanceof Error ? e.message : String(e);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Supabase 연결 테스트
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {isConnected ? (
            <div className="flex flex-col items-center gap-2 text-green-600">
              <CheckCircle2 className="w-16 h-16" />
              <p className="text-xl font-semibold">✅ Supabase 연결 성공!</p>
              <p className="text-sm text-gray-500">
                데이터베이스에 정상적으로 접근할 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-red-600 text-center">
              <XCircle className="w-16 h-16" />
              <p className="text-xl font-semibold">연결 실패</p>
              <p className="font-medium">{message}</p>
              {detail && (
                <p className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {detail}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
