const WORKFLOW_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const KRA_DATE_PATTERN = /^(\d{4})(\d{2})(\d{2})$/;

/**
 * GitHub Actions와 관리자 화면에서 받는 날짜를 KRA API 요청 형식으로 변환합니다.
 *
 * 사람이 입력하는 workflow 값은 읽기 쉬운 `YYYY-MM-DD` 형식을 사용하지만, KRA API는
 * `YYYYMMDD` 형식을 요구할 가능성이 있습니다. 이 함수는 API 요청 직전에 형식을
 * 한곳에서 통일해 각 스크립트가 서로 다른 날짜를 보내는 실수를 방지합니다.
 *
 * PoC를 터미널에서 직접 실행할 때 기존 `YYYYMMDD` 값이 전달될 수도 있으므로 두 형식을
 * 모두 허용합니다. 단순히 하이픈만 제거하면 `2026-02-31` 같은 존재하지 않는 날짜도
 * 통과하므로, 연·월·일이 실제 달력에 존재하는지까지 검증합니다.
 *
 * @param input workflow 또는 셸 환경변수에서 받은 날짜
 * @returns KRA API 요청에 사용할 `YYYYMMDD` 문자열
 * @throws 지원하지 않는 형식이거나 실제 달력에 없는 날짜일 때 명확한 오류
 */
export function toKraDate(input: string): string {
  const normalizedInput = input.trim();
  const match =
    WORKFLOW_DATE_PATTERN.exec(normalizedInput) ??
    KRA_DATE_PATTERN.exec(normalizedInput);

  if (!match) {
    throw new Error(
      `날짜 형식이 올바르지 않습니다: "${input}". YYYY-MM-DD 또는 YYYYMMDD 형식으로 입력해 주세요.`,
    );
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(
      `존재하지 않는 날짜입니다: "${input}". 실제 달력 날짜를 입력해 주세요.`,
    );
  }

  return `${yearText}${monthText}${dayText}`;
}
