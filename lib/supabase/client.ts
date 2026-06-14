import { createBrowserClient } from "@supabase/ssr";

/**
 * 브라우저 컴포넌트에서 사용하는 Supabase 클라이언트를 만듭니다.
 *
 * `NEXT_PUBLIC_` 접두사가 붙은 URL과 익명 키만 브라우저 번들에 포함될 수 있습니다.
 * `SUPABASE_SERVICE_ROLE_KEY`는 모든 행 수준 보안 정책을 우회할 수 있는 서버 전용
 * 비밀이므로 이 파일에서 읽거나 인자로 전달해서는 안 됩니다.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "브라우저용 Supabase 환경변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)가 필요합니다.",
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
