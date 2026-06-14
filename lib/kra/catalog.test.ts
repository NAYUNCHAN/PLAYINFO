import assert from "node:assert/strict";
import test from "node:test";

import { getKraEndpoint } from "./catalog.ts";

test("지원하는 job_type을 endpoint 정의로 변환한다", () => {
  assert.equal(getKraEndpoint("race_results").sampleDirectory, "race-results");
});

test("지원하지 않는 job_type을 명확하게 거부한다", () => {
  assert.throws(
    () => getKraEndpoint("unknown_job"),
    /Unsupported KRA job_type/,
  );
});
