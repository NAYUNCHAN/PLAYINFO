import assert from "node:assert/strict";
import test from "node:test";

import type { KraApiKeyEnvName } from "./catalog.ts";
import { getKraEndpoint } from "./catalog.ts";
import { fetchKraJson } from "./client.ts";

const API_KEY_ENV_NAMES: KraApiKeyEnvName[] = [
  "KRA_RACE_INFO_API_KEY",
  "KRA_RACE_DETAIL_RESULT_API_KEY",
  "KRA_CANCELLATION_API_KEY",
  "KRA_JOCKEY_CHANGE_API_KEY",
];

function preserveEnvironment(names: string[]): () => void {
  const previousValues = new Map(
    names.map((name) => [name, process.env[name]] as const),
  );

  return () => {
    previousValues.forEach((value, name) => {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    });
  };
}

const REQUIRED_KEY_CASES = [
  ["race_info", "KRA_RACE_INFO_API_KEY"],
  ["race_results", "KRA_RACE_DETAIL_RESULT_API_KEY"],
  ["cancellations", "KRA_CANCELLATION_API_KEY"],
  ["jockey_changes", "KRA_JOCKEY_CHANGE_API_KEY"],
] as const;

for (const [jobType, expectedEnvName] of REQUIRED_KEY_CASES) {
  test(`${jobType}가 ${expectedEnvName}을 요구한다`, async () => {
    const restoreEnvironment = preserveEnvironment([
      ...API_KEY_ENV_NAMES,
      "KRA_API_BASE_URL",
    ]);
    API_KEY_ENV_NAMES.forEach((name) => delete process.env[name]);
    process.env.KRA_API_BASE_URL = "http://example.invalid";

    try {
      await assert.rejects(
        fetchKraJson({
          endpoint: getKraEndpoint(jobType),
          jobType,
          targetDate: "2026-06-14",
          params: {},
        }),
        (error: Error) => {
          assert.equal(
            error.message,
            `Missing required environment variable: ${expectedEnvName}`,
          );
          assert.doesNotMatch(error.message, /dummy-key-value/);
          return true;
        },
      );
    } finally {
      restoreEnvironment();
    }
  });
}

test("JSON 파싱 실패 오류에 인증키와 전체 URL을 포함하지 않는다", async () => {
  const dummyKey = "dummy-key-value";
  const restoreEnvironment = preserveEnvironment([
    ...API_KEY_ENV_NAMES,
    "KRA_API_BASE_URL",
  ]);
  const originalFetch = globalThis.fetch;
  process.env.KRA_RACE_INFO_API_KEY = dummyKey;
  process.env.KRA_API_BASE_URL = "http://example.invalid";
  globalThis.fetch = async () =>
    new Response("not-json", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });

  try {
    await assert.rejects(
      fetchKraJson({
        endpoint: getKraEndpoint("race_info"),
        jobType: "race_info",
        targetDate: "2026-06-14",
        params: { rc_date: "20260614" },
      }),
      (error: Error) => {
        assert.match(error.message, /response was not valid JSON/);
        assert.doesNotMatch(error.message, new RegExp(dummyKey));
        assert.doesNotMatch(error.message, /serviceKey/);
        assert.doesNotMatch(error.message, /example\.invalid/);
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnvironment();
  }
});
