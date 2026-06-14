import { withRetry } from "./retry.ts";

export interface KraPocRequest {
  label: string;
  endpoint: string;
  params: Record<string, string | undefined>;
}

/**
 * 네 개의 PoC 스크립트가 같은 검증·요청·오류 처리 방식을 사용하도록 공통화합니다.
 * 현재 응답은 저장하지 않고 일부 형태만 출력합니다. API 명세가 확정되면 필요한
 * 필드만 정규화해 저장하며, 원본 응답 전체를 보존하는 방식은 사용하지 않습니다.
 */
export async function runKraPoc({
  label,
  endpoint,
  params,
}: KraPocRequest): Promise<void> {
  // KRA_API_KEY는 공공데이터 요청 인증에만 사용하는 서버/스크립트용 키입니다.
  // 브라우저에서 읽을 수 있는 NEXT_PUBLIC_ 접두사를 붙이지 않습니다.
  const apiKey = process.env.KRA_API_KEY;
  if (!apiKey) {
    throw new Error(
      `${label} 실행 실패: KRA_API_KEY가 없습니다. .env.local 또는 실행 환경의 비밀 변수에 키를 설정해 주세요.`,
    );
  }

  const url = new URL(endpoint);
  url.searchParams.set("serviceKey", apiKey);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  console.log(`[${label}] 요청 조건`, params);

  const response = await withRetry(async () => {
    const result = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!result.ok) {
      throw new Error(
        `${label} HTTP 오류: ${result.status} ${result.statusText}`,
      );
    }

    return result;
  });

  const body: unknown = await response.json();
  console.log(`[${label}] 응답 샘플`, body);
}
