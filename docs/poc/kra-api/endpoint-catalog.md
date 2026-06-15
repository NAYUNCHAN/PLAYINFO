# KRA endpoint catalog

## 판정 기준

- **제공 확인**: 공공데이터포털 공식 페이지에서 데이터 상품과 설명을 확인함
- **경로 후보**: 코드에 요청 구조를 만들었지만 승인 화면 및 성공 응답 대조가 필요함
- **호출 확인**: 유효한 키로 성공 응답과 형식을 확인함

현재 작업 환경에는 서비스별 인증 키가 없어 모든 항목의 **호출 확인은 보류** 상태입니다.

| job_type | API 구분 | 사용할 Secret | 코드 경로 상태 | 응답 형식 확인 | 공식 자료 |
| --- | --- | --- | --- | --- | --- |
| `race_info` / `race_schedule` | 경주정보 | `KRA_RACE_INFO_API_KEY` | 기존 PoC 후보, 재검증 필요 | JSON 후보 | [RC경마경주정보](https://www.data.go.kr/data/15063950/openapi.do) |
| `race_results` | 경주결과 | `KRA_RACE_DETAIL_RESULT_API_KEY` | `/B551015/racedetailresult/getracedetailresult` 후보 | 공식 페이지는 XML 표기, JSON 보류 | [경주별상세성적표](https://www.data.go.kr/data/15089492/openapi.do) |
| `dividends` | 확정배당 | `KRA_RACE_INFO_API_KEY` 임시 | 독립 경로 존재 여부 보류 | 보류 | [RC경마경주정보](https://www.data.go.kr/data/15063950/openapi.do) |
| `horse_weight` | 마체중 | `KRA_RACE_DETAIL_RESULT_API_KEY` 임시 | 독립 경로 존재 여부 보류 | 보류 | [경주별상세성적표](https://www.data.go.kr/data/15089492/openapi.do) |
| `cancellations` | 출전취소 | `KRA_CANCELLATION_API_KEY` | 승인 화면에서 경로 재확인 필요 | JSON 제공 표기 | [경주마 출전취소 정보](https://www.data.go.kr/data/15056779/openapi.do) |
| `jockey_changes` | 기수변경 | `KRA_JOCKEY_CHANGE_API_KEY` | 승인 화면에서 경로 재확인 필요 | JSON 제공 표기 | [기수변경 정보](https://www.data.go.kr/data/15057181/openapi.do) |

`dividends`는 현재 경주정보 catalog 후보를 따르므로 경주정보 키를 임시 사용합니다.
`horse_weight`는 상세성적표 필드라는 근거로 상세결과 키를 우선 사용하지만, 실제 독립
endpoint가 경주정보 서비스에 속하면 `apiKeyEnvName`을 경주정보 키로 변경해야 합니다.

## 확인된 요청 변수 후보

- 상세성적표: `ServiceKey`, `pageNo`, `numOfRows`, `meet`, `rc_date`, `rc_no`
- 출전취소 및 기수변경: 날짜·경마장 관련 요청 변수가 상품별로 다를 수 있어 승인
  명세를 내려받아 재확인해야 합니다.
- 코드에서는 PoC 호환성을 위해 `rc_date`와 `race_dt`를 함께 조립합니다. 성공 호출 후
  각 endpoint에 필요하지 않은 변수를 제거해야 합니다.

## 확정 절차

1. 각 데이터 상품을 활용신청합니다.
2. 승인 화면의 서비스 URL, 요청주소, 필수 요청 변수를 이 표와 대조합니다.
3. 응답 본문을 로그로 출력하지 않고 JSON 파싱 성공 여부를 확인합니다.
4. 검수된 샘플 한 건으로 필드명을 확인합니다.
5. 코드의 `verificationStatus`를 `confirmed`로 변경하고 확인일을 문서에 기록합니다.
