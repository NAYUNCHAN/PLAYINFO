import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { KraEndpointDefinition } from "./catalog.ts";

const RACECOURSE_PATTERN = /^(SEOUL|BUSAN|JEJU)$/;
const KRA_DATE_PATTERN = /^\d{8}$/;
const SECRET_FIELD_PATTERN =
  /^(servicekey|apikey|api_key|authorization|signature|token)$/i;

export interface SamplePathInput {
  endpoint: KraEndpointDefinition;
  racecourse: string;
  kraDate: string;
  raceNo?: number;
}

/**
 * 샘플 파일 경로를 허용된 값만으로 조립해 경로 이탈(path traversal)을 막습니다.
 *
 * 외부 입력을 그대로 파일명에 넣으면 `../` 같은 값으로 저장소 밖에 파일을 쓸 수
 * 있습니다. 경마장, 날짜, 경주번호를 각각 제한한 뒤 고정된 samples/kra 하위에만
 * 저장되도록 합니다.
 */
export function createSamplePath({
  endpoint,
  racecourse,
  kraDate,
  raceNo,
}: SamplePathInput): string {
  if (!RACECOURSE_PATTERN.test(racecourse)) {
    throw new Error(`Invalid racecourse for sample path: ${racecourse}`);
  }
  if (!KRA_DATE_PATTERN.test(kraDate)) {
    throw new Error(`Invalid KRA date for sample path: ${kraDate}`);
  }
  if (
    raceNo !== undefined &&
    (!Number.isInteger(raceNo) || raceNo < 1 || raceNo > 99)
  ) {
    throw new Error(`Invalid race number for sample path: ${raceNo}`);
  }

  const raceSuffix = raceNo === undefined ? "" : `_${raceNo}R`;
  const fileName = `${racecourse}_${kraDate}${raceSuffix}.sample.json`;
  return path.join("samples", "kra", endpoint.sampleDirectory, fileName);
}

/**
 * 검증용 JSON에 인증 관련 필드가 섞여 있으면 재귀적으로 제거합니다.
 * 키 이름을 기준으로 방어하며, 실제 API Key 값 자체는 함수 인자로 받지 않습니다.
 */
export function removeSecretFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(removeSecretFields);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !SECRET_FIELD_PATTERN.test(key))
        .map(([key, child]) => [key, removeSecretFields(child)]),
    );
  }
  return value;
}

export async function saveKraSample(
  filePath: string,
  payload: unknown,
): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    filePath,
    `${JSON.stringify(removeSecretFields(payload), null, 2)}\n`,
    "utf8",
  );
}
