# KRA API 실제 PoC

## PoC 목적

Race Note가 사용할 KRA 공공데이터의 요청 경로, 응답 형식, 식별자 안정성 및 반영
시점을 실제 호출로 검증합니다. 이번 단계는 데이터 구조를 확인하는 작업이며 화면을
개발하지 않습니다. 필드와 갱신 특성을 확인하기 전에 UI를 만들면 잘못된 데이터 계약을
화면에 고정할 위험이 있기 때문입니다.

## 실행 전 환경변수

```dotenv
KRA_API_KEY=
KRA_API_BASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

- `KRA_API_KEY`: 공공데이터포털에서 발급받은 인증 키
- `KRA_API_BASE_URL`: 승인된 API의 공통 URL(예: 프로토콜과 호스트 부분)
- Supabase 변수는 이번 PoC에서 사용하지 않으며 이후 정규화 저장 단계용 이름만 정합니다.
- 실제 값은 `.env.example`, 문서, 소스, 커밋, 실행 로그에 입력하지 않습니다.

## 실행 명령어

```bash
npm run poc:kra -- --job race_info --date 2026-06-14 --racecourse SEOUL
npm run poc:kra -- --job race_results --date 2026-06-14 --racecourse SEOUL --race-no 7
npm run poc:kra -- --job dividends --date 2026-06-14 --racecourse SEOUL --race-no 7
npm run poc:kra -- --job horse_weight --date 2026-06-14 --racecourse SEOUL --race-no 7
```

검증용 샘플이 꼭 필요할 때만 `--save-sample`을 추가합니다. 기본 실행은 JSON 파싱
성공 여부만 출력하고 응답 본문을 로그에 출력하거나 파일로 저장하지 않습니다.

## job_type

| job_type | 목적 | 현재 상태 |
| --- | --- | --- |
| `race_info` | 경주정보 조사 | endpoint 후보 검증 필요 |
| `race_schedule` | `race_info` 별칭 | endpoint 후보 검증 필요 |
| `race_results` | 경주결과 조사 | 공식 상세성적표 경로 후보 확인, JSON 지원 검증 필요 |
| `dividends` | 확정배당 조사 | 독립 API 여부 검증 필요 |
| `horse_weight` | 마체중 조사 | 독립 API 여부 검증 필요 |
| `cancellations` | 출전취소 조사 | 공식 제공 데이터 존재 확인, 승인 경로 검증 필요 |
| `jockey_changes` | 기수변경 조사 | 공식 제공 데이터 존재 확인, 승인 경로 검증 필요 |

## 샘플 JSON 저장 위치

`samples/kra/<API 구분>/` 아래에
`SEOUL_20260614_7R.sample.json` 형식으로 저장합니다. 샘플 저장기는 허용된 경마장,
8자리 날짜, 1~99 경주번호만 파일명으로 사용하고 인증 관련 필드를 재귀적으로 제거합니다.

> **운영 DB에는 원본 API 응답 전문 저장 금지.** 이 디렉터리는 필드 검증을 위한
> 제한된 PoC 샘플만 보관합니다. 개인정보·인증 값·요청 서명 값이 없는지 사람이 다시
> 검수한 뒤 커밋해야 합니다.

## API Key 노출 금지 원칙

- 요청 URL 전체를 출력하지 않습니다. query string에 인증 값이 포함될 수 있습니다.
- 키 누락 시 `Missing required environment variable: KRA_API_KEY`만 출력합니다.
- HTTP 실패 로그에는 상태 코드, endpoint 이름, job_type, target_date만 포함합니다.
- 샘플 파일을 커밋하기 전에 `serviceKey`, `authorization`, `signature`, `token`류가
  제거되었는지 재검수합니다.

## 실제 호출 실패 시 확인할 항목

1. `KRA_API_KEY`와 `KRA_API_BASE_URL`이 실행 환경에 등록되어 있는지 확인합니다.
2. 공공데이터포털에서 해당 서비스 활용신청이 승인되었는지 확인합니다.
3. `endpoint-catalog.md`의 경로 후보와 승인 화면의 요청주소가 같은지 확인합니다.
4. 날짜가 `YYYY-MM-DD` 또는 `YYYYMMDD`인지, 경마장 코드와 경주번호가 유효한지 확인합니다.
5. HTTP 상태와 endpoint 이름만 사용해 인증, 호출량 제한, 서버 응답 문제를 구분합니다.

## PoC 통과 기준

- 승인된 요청주소로 JSON 응답을 반복해서 받을 수 있습니다.
- 말·기수·조교사 식별자의 API 간 일관성을 표본으로 확인합니다.
- 결과와 확정배당의 반영 시점을 별도 호출로 비교할 수 있습니다.
- 필요한 필드만 정규화하는 테이블 및 upsert 키를 제안할 수 있습니다.
- 인증 값 없이 재현 가능한 샘플과 필드 문서를 남길 수 있습니다.

## PoC 보류 기준

- 승인 후에도 endpoint 또는 응답 형식을 재현하지 못합니다.
- 핵심 식별자가 없거나 API마다 달라 자동 연결의 오탐 위험이 큽니다.
- 결과 확정 여부나 배당의 공식 확정 상태를 판별할 수 없습니다.
- 호출 제한 또는 반영 지연으로 무료 운영 범위에서 안정적인 수집이 어렵습니다.

## 관련 문서

- [endpoint catalog](./endpoint-catalog.md)
- [field mapping](./field-mapping.md)
- [missing fields](./missing-fields.md)
- [normalization candidates](./normalization-candidates.md)
- [limitations report draft](./limitations-report-draft.md)
