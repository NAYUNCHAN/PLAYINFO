import assert from "node:assert/strict";
import test from "node:test";

import { fetchKraJson } from "./client.ts";
import { getKraEndpoint } from "./catalog.ts";

test("API Key가 없으면 이름만 포함한 오류로 안전하게 실패한다", async () => {
  const previousApiKey = process.env.KRA_API_KEY;
  const previousBaseUrl = process.env.KRA_API_BASE_URL;
  delete process.env.KRA_API_KEY;
  process.env.KRA_API_BASE_URL = "https://example.invalid";

  try {
    await assert.rejects(
      fetchKraJson({
        endpoint: getKraEndpoint("race_info"),
        jobType: "race_info",
        targetDate: "2026-06-14",
        params: {},
      }),
      (error: Error) => {
        assert.equal(
          error.message,
          "Missing required environment variable: KRA_API_KEY",
        );
        assert.doesNotMatch(error.message, /example-secret/);
        return true;
      },
    );
  } finally {
    if (previousApiKey === undefined) delete process.env.KRA_API_KEY;
    else process.env.KRA_API_KEY = previousApiKey;
    if (previousBaseUrl === undefined) delete process.env.KRA_API_BASE_URL;
    else process.env.KRA_API_BASE_URL = previousBaseUrl;
  }
});

test("JSON 파싱 실패 오류에 API Key와 전체 URL을 포함하지 않는다", async () => {
  const secret = "test-only-secret-that-must-not-appear";
  const previousApiKey = process.env.KRA_API_KEY;
  const previousBaseUrl = process.env.KRA_API_BASE_URL;
  const originalFetch = globalThis.fetch;
  process.env.KRA_API_KEY = secret;
  process.env.KRA_API_BASE_URL = "https://example.invalid";
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
        assert.doesNotMatch(error.message, new RegExp(secret));
        assert.doesNotMatch(error.message, /serviceKey/);
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (previousApiKey === undefined) delete process.env.KRA_API_KEY;
    else process.env.KRA_API_KEY = previousApiKey;
    if (previousBaseUrl === undefined) delete process.env.KRA_API_BASE_URL;
    else process.env.KRA_API_BASE_URL = previousBaseUrl;
  }
});
