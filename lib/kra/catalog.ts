export const KRA_JOB_TYPES = [
  "race_info",
  "race_schedule",
  "race_results",
  "dividends",
  "horse_weight",
  "cancellations",
  "jockey_changes",
] as const;

export type KraJobType = (typeof KRA_JOB_TYPES)[number];

export interface KraEndpointDefinition {
  jobType: KraJobType;
  endpointName: string;
  path: string;
  sampleDirectory: string;
  verificationStatus: "candidate" | "confirmed";
  notes: string;
}

/**
 * PoC에서 조사할 API와 요청 경로 후보를 한곳에서 관리합니다.
 *
 * 공공데이터포털의 서비스는 개별 활용신청에 따라 서비스 URL이 달라질 수 있습니다.
 * 따라서 문서와 실제 승인 화면을 대조하기 전에는 `candidate`로 유지하고, 경로가
 * 공식 명세 및 성공 응답으로 검증된 뒤에만 `confirmed`로 변경합니다.
 */
const ENDPOINT_CATALOG: Record<KraJobType, KraEndpointDefinition> = {
  race_info: {
    jobType: "race_info",
    endpointName: "경주정보",
    path: "/B551015/API8_2/raceInfo",
    sampleDirectory: "race-info",
    verificationStatus: "candidate",
    notes: "기존 PoC 경로 후보이며 활용신청 후 공식 명세 대조가 필요합니다.",
  },
  race_schedule: {
    jobType: "race_schedule",
    endpointName: "경주정보",
    path: "/B551015/API8_2/raceInfo",
    sampleDirectory: "race-info",
    verificationStatus: "candidate",
    notes: "race_info의 별칭입니다.",
  },
  race_results: {
    jobType: "race_results",
    endpointName: "경주결과",
    path: "/B551015/racedetailresult/getracedetailresult",
    sampleDirectory: "race-results",
    verificationStatus: "candidate",
    notes:
      "공식 상세성적표 요청주소 후보입니다. 해당 명세는 XML로 표시되어 JSON 지원 여부 확인이 필요합니다.",
  },
  dividends: {
    jobType: "dividends",
    endpointName: "확정배당",
    path: "/B551015/API8_2/dividend",
    sampleDirectory: "dividends",
    verificationStatus: "candidate",
    notes: "독립 API인지 경주정보 응답 필드인지 추가 확인이 필요합니다.",
  },
  horse_weight: {
    jobType: "horse_weight",
    endpointName: "마체중",
    path: "/B551015/API8_2/horseWeight",
    sampleDirectory: "horse-weight",
    verificationStatus: "candidate",
    notes: "독립 API인지 상세성적표 필드인지 추가 확인이 필요합니다.",
  },
  cancellations: {
    jobType: "cancellations",
    endpointName: "출전취소",
    path: "/B551015/API26_1/raceHorseCancelInfo_1",
    sampleDirectory: "cancellations",
    verificationStatus: "candidate",
    notes: "공식 제공 데이터는 확인했으며 활용신청 화면에서 서비스 경로를 재확인합니다.",
  },
  jockey_changes: {
    jobType: "jockey_changes",
    endpointName: "기수변경",
    path: "/B551015/API20_1/jockeyChangeInfo_1",
    sampleDirectory: "jockey-changes",
    verificationStatus: "candidate",
    notes: "공식 제공 데이터는 확인했으며 활용신청 화면에서 서비스 경로를 재확인합니다.",
  },
};

export function getKraEndpoint(jobType: string): KraEndpointDefinition {
  if (!KRA_JOB_TYPES.includes(jobType as KraJobType)) {
    throw new Error(
      `Unsupported KRA job_type: ${jobType}. Allowed values: ${KRA_JOB_TYPES.join(", ")}`,
    );
  }

  return ENDPOINT_CATALOG[jobType as KraJobType];
}
