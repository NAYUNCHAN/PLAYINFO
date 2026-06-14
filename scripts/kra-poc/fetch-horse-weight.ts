import { runKraPoc } from "../../lib/kra/poc.ts";
import { toKraDate } from "../../lib/kra/date.ts";

// TODO: 실제 endpoint 확인 필요. 현재 URL은 실행 구조 검증을 위한 자리표시자입니다.
const ENDPOINT = "https://apis.data.go.kr/B551015/API8_2/horseWeight";

async function main() {
  await runKraPoc({
    label: "마체중 PoC",
    endpoint: ENDPOINT,
    params: {
      // 입력 예시: TARGET_DATE=2026-06-14 RACECOURSE=SEOUL RACE_NO=7
      meet: process.env.RACECOURSE ?? "SEOUL",
      rc_date: toKraDate(process.env.TARGET_DATE ?? "2026-06-14"),
      rc_no: process.env.RACE_NO ?? "7",
      _type: "json",
    },
  });
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "마체중 PoC에서 알 수 없는 오류가 발생했습니다.",
  );
  process.exitCode = 1;
});
