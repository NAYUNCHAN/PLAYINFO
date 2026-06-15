import assert from "node:assert/strict";
import test from "node:test";

import { getKraEndpoint } from "./catalog.ts";
import { createSamplePath, removeSecretFields } from "./sample.ts";

test("허용된 입력으로 고정된 샘플 저장 경로를 만든다", () => {
  assert.equal(
    createSamplePath({
      endpoint: getKraEndpoint("race_results"),
      racecourse: "SEOUL",
      kraDate: "20260614",
      raceNo: 7,
    }),
    "samples/kra/race-results/SEOUL_20260614_7R.sample.json",
  );
});

test("경로 이탈 문자가 포함된 경마장을 거부한다", () => {
  assert.throws(
    () =>
      createSamplePath({
        endpoint: getKraEndpoint("race_results"),
        racecourse: "../SEOUL",
        kraDate: "20260614",
      }),
    /Invalid racecourse/,
  );
});

test("중첩된 인증 관련 필드를 샘플에서 제거한다", () => {
  assert.deepEqual(
    removeSecretFields({
      data: [{ hrNo: "001", serviceKey: "dummy-value" }],
      authorization: "dummy-value",
    }),
    { data: [{ hrNo: "001" }] },
  );
});
