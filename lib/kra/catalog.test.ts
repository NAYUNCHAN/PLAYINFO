import assert from "node:assert/strict";
import test from "node:test";

import { getKraEndpoint } from "./catalog.ts";

test("지원하는 job_type을 endpoint 정의로 변환한다", () => {
  assert.equal(getKraEndpoint("race_results").sampleDirectory, "race-results");
});

test("임시 API를 포함한 job_type별 인증키 환경변수를 명시한다", () => {
  assert.equal(
    getKraEndpoint("race_info").apiKeyEnvName,
    "KRA_RACE_INFO_API_KEY",
  );
  assert.equal(
    getKraEndpoint("race_results").apiKeyEnvName,
    "KRA_RACE_DETAIL_RESULT_API_KEY",
  );
  assert.equal(
    getKraEndpoint("dividends").apiKeyEnvName,
    "KRA_RACE_INFO_API_KEY",
  );
  assert.equal(
    getKraEndpoint("horse_weight").apiKeyEnvName,
    "KRA_RACE_DETAIL_RESULT_API_KEY",
  );
});

test("지원하지 않는 job_type을 명확하게 거부한다", () => {
  assert.throws(
    () => getKraEndpoint("unknown_job"),
    /Unsupported KRA job_type/,
  );
});
