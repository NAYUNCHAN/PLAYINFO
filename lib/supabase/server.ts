import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * 신뢰할 수 있는 서버 코드에서만 사용하는 관리자용 Supabase 클라이언트를 만듭니다.
 *
 * Service Role Key는 데이터베이스의 행 수준 보안(RLS)을 우회할 수 있으므로
 * GitHub Actions 수집기, 서버 전용 스크립트처럼 통제된 환경에서만 사용해야 합니다.
 * 이 함수가 들어 있는 모듈을 Client Component에서 import하거나 반환값을 브라우저에
 * 직렬화하면 비밀 키가 노출될 수 있으므로 절대 그렇게 사용하지 않습니다.
 *
 * 인증 세션과 쿠키를 다루는 일반 사용자용 서버 클라이언트는 인증 구현 단계에서
 * 별도로 추가합니다. 현재 함수는 이후 수집기가 정제된 데이터를 저장할 준비만 합니다.
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "서버용 Supabase 환경변수(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)가 필요합니다.",
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
