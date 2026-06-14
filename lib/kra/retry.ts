const DEFAULT_RETRY_DELAYS_MS = [10_000, 30_000, 60_000] as const;

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

/**
 * 일시적인 네트워크 장애나 공공 API의 순간적인 과부하를 견디기 위해 작업을 재시도합니다.
 *
 * 즉시 무한 반복하면 장애 중인 API에 요청을 계속 보내 부담을 키우고 GitHub Actions의
 * 무료 실행 시간도 불필요하게 소모합니다. 따라서 재시도 횟수를 최대 3회로 제한합니다.
 * 10초, 30초, 60초로 대기 시간을 늘리면 짧은 장애에는 빠르게 대응하면서도 장애가
 * 길어질수록 API가 회복할 시간을 더 줄 수 있습니다.
 *
 * GitHub Actions에서는 실행 화면의 로그가 원격 장애를 파악하는 핵심 단서입니다.
 * 각 시도 번호와 대기 시간을 출력해 관리자가 실패 지점을 쉽게 추적할 수 있게 합니다.
 *
 * @param operation 최초 실행 및 재시도 때마다 새로 호출할 비동기 작업
 * @param retryDelaysMs 테스트 또는 특수 작업에서만 교체할 재시도 대기 시간 목록
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  retryDelaysMs: readonly number[] = DEFAULT_RETRY_DELAYS_MS,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retryDelaysMs.length + 1; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt > retryDelaysMs.length) {
        break;
      }

      const delayMs = retryDelaysMs[attempt - 1];
      console.warn(
        `[KRA retry] ${attempt}번째 요청이 실패했습니다. ${delayMs / 1000}초 후 ${attempt + 1}번째 요청을 시도합니다.`,
      );
      await sleep(delayMs);
    }
  }

  throw new Error(
    `KRA API 요청이 최초 요청과 최대 ${retryDelaysMs.length}회 재시도 후에도 실패했습니다.`,
    { cause: lastError },
  );
}
