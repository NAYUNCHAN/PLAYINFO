const DEFAULT_RETRY_DELAYS_MS = [10_000, 30_000, 60_000] as const;

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export interface RetryOptions {
  retryDelaysMs?: readonly number[];
  shouldRetry?: (error: unknown) => boolean;
}

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
 * @param options 대기 시간과 오류별 재시도 여부를 정하는 선택 옵션
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  {
    retryDelaysMs = DEFAULT_RETRY_DELAYS_MS,
    shouldRetry = () => true,
  }: RetryOptions = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retryDelaysMs.length + 1; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // 잘못된 요청이나 인증 실패처럼 다시 시도해도 결과가 달라지지 않는 오류는
      // 대기하지 않고 원래 오류를 즉시 전달합니다. 이 분기가 불필요한 API 호출과
      // GitHub Actions 실행 시간 낭비를 막습니다.
      if (!shouldRetry(error)) {
        throw error;
      }

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

  // 마지막 오류를 그대로 전달해야 호출자가 HTTP status와 안전하게 정제된 문맥을
  // 유지할 수 있습니다. Error가 아닌 값이 throw된 예외적인 경우에만 감싸서 전달합니다.
  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error("KRA API 요청이 모든 재시도 후에도 실패했습니다.", {
    cause: lastError,
  });
}
