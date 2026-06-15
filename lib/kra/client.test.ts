import assert from "node:assert/strict";
import test from "node:test";

import type { KraApiKeyEnvName } from "./catalog.ts";
import { getKraEndpoint } from "./catalog.ts";
import {
  fetchKraJson,
  isNonRetryableHttpStatus,
  isRetryableHttpStatus,
} from "./client.ts";

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

const NON_RETRYABLE_STATUSES = [400, 401, 403, 404, 422] as const;
const RETRYABLE_STATUSES = [408, 429, 500, 503] as const;

for (const status of NON_RETRYABLE_STATUSES) {
  test(`${status} HTTP 오류는 재시도하지 않고 즉시 실패한다`, async () => {
    const restoreEnvironment = preserveEnvironment([
      ...API_KEY_ENV_NAMES,
      "KRA_API_BASE_URL",
    ]);
    const originalFetch = globalThis.fetch;
    const dummyKey = "dummy-key-value";
    let fetchCount = 0;
    process.env.KRA_RACE_INFO_API_KEY = dummyKey;
    process.env.KRA_API_BASE_URL = "http://example.invalid";
    globalThis.fetch = async () => {
      fetchCount += 1;
      return new Response(null, { status });
    };

    try {
      await assert.rejects(
        fetchKraJson(
          {
            endpoint: getKraEndpoint("race_info"),
            jobType: "race_info",
            targetDate: "2026-06-14",
            params: {},
          },
          { retryDelaysMs: [0, 0, 0] },
        ),
        (error: Error) => {
          assert.equal(
            error.message,
            `KRA API request failed: status=${status}, endpoint=경주정보, job_type=race_info, target_date=2026-06-14`,
          );
          assert.doesNotMatch(error.message, new RegExp(dummyKey));
          assert.doesNotMatch(error.message, /serviceKey/);
          assert.doesNotMatch(error.message, /example\.invalid/);
          return true;
        },
      );
      assert.equal(fetchCount, 1);
      assert.equal(isNonRetryableHttpStatus(status), true);
      assert.equal(isRetryableHttpStatus(status), false);
    } finally {
      globalThis.fetch = originalFetch;
      restoreEnvironment();
    }
  });
}

for (const status of RETRYABLE_STATUSES) {
  test(`${status} HTTP 오류는 최대 3회 재시도한다`, async () => {
    const restoreEnvironment = preserveEnvironment([
      ...API_KEY_ENV_NAMES,
      "KRA_API_BASE_URL",
    ]);
    const originalFetch = globalThis.fetch;
    const originalWarn = console.warn;
    let fetchCount = 0;
    process.env.KRA_RACE_INFO_API_KEY = "dummy-key-value";
    process.env.KRA_API_BASE_URL = "http://example.invalid";
    globalThis.fetch = async () => {
      fetchCount += 1;
      return new Response(null, { status });
    };
    console.warn = () => {};

    try {
      await assert.rejects(
        fetchKraJson(
          {
            endpoint: getKraEndpoint("race_info"),
            jobType: "race_info",
            targetDate: "2026-06-14",
            params: {},
          },
          { retryDelaysMs: [0, 0, 0] },
        ),
        new RegExp(`status=${status}`),
      );
      assert.equal(fetchCount, 4);
      assert.equal(isRetryableHttpStatus(status), true);
      assert.equal(isNonRetryableHttpStatus(status), false);
    } finally {
      console.warn = originalWarn;
      globalThis.fetch = originalFetch;
      restoreEnvironment();
    }
  });
}

test("fetch 네트워크 오류는 기존 정책에 따라 최대 3회 재시도한다", async () => {
  const restoreEnvironment = preserveEnvironment([
    ...API_KEY_ENV_NAMES,
    "KRA_API_BASE_URL",
  ]);
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  let fetchCount = 0;
  process.env.KRA_RACE_INFO_API_KEY = "dummy-key-value";
  process.env.KRA_API_BASE_URL = "http://example.invalid";
  globalThis.fetch = async () => {
    fetchCount += 1;
    throw new TypeError("dummy network failure");
  };
  console.warn = () => {};

  try {
    await assert.rejects(
      fetchKraJson(
        {
          endpoint: getKraEndpoint("race_info"),
          jobType: "race_info",
          targetDate: "2026-06-14",
          params: {},
        },
        { retryDelaysMs: [0, 0, 0] },
      ),
      /dummy network failure/,
    );
    assert.equal(fetchCount, 4);
  } finally {
    console.warn = originalWarn;
    globalThis.fetch = originalFetch;
    restoreEnvironment();
  }
});
