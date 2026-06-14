# KRA API PoC CLI

`run.ts`는 모든 KRA 조사 작업이 공통 클라이언트, endpoint catalog, 날짜 변환과
안전한 샘플 저장기를 사용하도록 만든 단일 진입점입니다.

```bash
npm run poc:kra -- --job race_results --date 2026-06-14 --racecourse SEOUL --race-no 7
```

전체 실행법, 환경변수와 보안 원칙은
[`docs/poc/kra-api/README.md`](../../docs/poc/kra-api/README.md)를 참고합니다.
