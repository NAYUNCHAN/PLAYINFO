import assert from "node:assert/strict";
import test from "node:test";

import { toKraDate } from "./date.ts";

test("workflow 날짜 형식을 KRA 요청 날짜 형식으로 변환한다", () => {
  assert.equal(toKraDate("2026-06-14"), "20260614");
});

test("이미 KRA 요청 형식인 날짜도 그대로 안전하게 처리한다", () => {
  assert.equal(toKraDate("20260614"), "20260614");
});

test("윤년의 유효한 2월 29일을 허용한다", () => {
  assert.equal(toKraDate("2024-02-29"), "20240229");
});

test("지원하지 않는 날짜 형식이면 입력 방법을 안내한다", () => {
  assert.throws(
    () => toKraDate("2026/06/14"),
    /YYYY-MM-DD 또는 YYYYMMDD/,
  );
});

test("달력에 존재하지 않는 날짜이면 명확한 오류를 반환한다", () => {
  assert.throws(() => toKraDate("2026-02-31"), /존재하지 않는 날짜/);
});
