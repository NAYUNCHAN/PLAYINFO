# KRA API 필드 매핑 초안

아래 내용은 공공데이터포털 설명과 상세성적표 명세를 바탕으로 한 **추정 매핑**입니다.
실제 JSON 샘플을 확보하면 대소문자, null 가능성, 숫자/문자 타입을 다시 확정합니다.

| API 구분 | 원본 필드명 | 추정 의미 | 타입 추정 | 정규화 후보 테이블 | 정규화 후보 컬럼 | 필수 여부 | 비고 |
| ------ | ------ | ----- | ----- | ---------- | --------- | ----- | -- |
| 경주정보 | `meet` | 경마장 | string | racecourses | source_code | 필수 후보 | 코드 1/2/3 매핑 검증 |
| 경주정보 | `rcDate` | 경주일자 | string | races | race_date | 필수 후보 | YYYYMMDD 예상 |
| 경주정보 | `rcNo` | 경주번호 | number | races | race_no | 필수 후보 | 1~99 |
| 경주정보 | `rcDist` | 경주거리 | number | races | distance_m | 선택 후보 | 단위 검증 |
| 경주정보 | `hrNo` | 마번 | string | horses | horse_no | 필수 후보 | 앞자리 0 보존 |
| 경주정보 | `hrName` | 마명 | string | horses | name | 필수 후보 | 식별키로 단독 사용 금지 |
| 경주정보 | `jkNo` | 기수번호 | string | jockeys | jockey_no | 검증 필요 | API별 동일성 확인 |
| 경주정보 | `trNo` | 조교사번호 | string | trainers | trainer_no | 검증 필요 | API별 동일성 확인 |
| 경주정보 | `chulNo` | 출주번호 | number | race_entries | entry_no | 필수 후보 | 마번과 구분 |
| 경주정보 | `wgBudam` | 부담중량 | number | race_entries | assigned_weight | 선택 후보 | 소수 가능성 확인 |
| 경주결과 | `stOrd` | 착순 | string | race_results | finish_position | 선택 후보 | 제외·실격 문자 가능성 |
| 경주결과 | `rcTime` | 경주기록 | string | race_results | race_time | 선택 후보 | 저장 단위 결정 필요 |
| 경주결과 | `diffUnit` | 도착차 | string | race_results | margin | 선택 후보 | 원문/구조화 병행 검토 |
| 경주결과 | `wgHr` | 마체중 | number | race_entries | horse_weight | 선택 후보 | 상세성적표 필드명 재확인 |
| 경주결과 | `wgHrDiff` | 마체중 증감 | number | race_entries | horse_weight_change | 선택 후보 | 부호 파싱 검증 |
| 경주결과 | `winOdds` | 단승 배당률 | number | dividends | payout_rate | 선택 후보 | 승식 코드 분리 |
| 경주결과 | `plcOdds` | 연승 배당률 | number | dividends | payout_rate | 선택 후보 | 조합 필드 확인 |
| 확정배당 | 미확정 | 승식 구분 | string | dividends | bet_type | 필수 후보 | 실제 샘플 필요 |
| 확정배당 | 미확정 | 적중 조합 | string | dividends | combination | 필수 후보 | 정렬 규칙 결정 필요 |
| 확정배당 | 미확정 | 확정 배당률 | number | dividends | payout_rate | 필수 후보 | 공식 확정 판정 필요 |
| 마체중 | `wgHr` 후보 | 마체중 | number | race_entries | horse_weight | 선택 후보 | 독립 API 여부 보류 |
| 마체중 | `wgHrDiff` 후보 | 증감 | number | race_entries | horse_weight_change | 선택 후보 | 기준 경주 확인 |
| 출전취소 | `meet` 후보 | 시행 경마장 | string | racecourses | source_code | 필수 후보 | 실제 필드명 확인 |
| 출전취소 | `rcDate` 후보 | 경주일자 | string | races | race_date | 필수 후보 | 실제 필드명 확인 |
| 출전취소 | `rcNo` 후보 | 경주번호 | number | races | race_no | 필수 후보 | 실제 필드명 확인 |
| 출전취소 | `hrNo` 후보 | 마번 | string | horses | horse_no | 검증 필요 | 상품 설명상 제공 |
| 출전취소 | `reason` 후보 | 변경사유 | string | race_entries | cancellation_reason | 선택 후보 | 실제 필드명 확인 |
| 기수변경 | 미확정 | 변경 전 기수명 | string | race_entries | previous_jockey_name | 선택 후보 | 번호 제공 여부 확인 |
| 기수변경 | 미확정 | 변경 후 기수명 | string | race_entries | changed_jockey_name | 선택 후보 | 번호 제공 여부 확인 |
| 기수변경 | 미확정 | 변경 전 부담중량 | number | race_entries | previous_assigned_weight | 선택 후보 | 타입 확인 |
| 기수변경 | 미확정 | 변경 후 부담중량 | number | race_entries | assigned_weight | 선택 후보 | 타입 확인 |
| 공통 로그 | HTTP status | 요청 상태 | number | data_fetch_logs | error_message | 실패 시 | 비밀 값 저장 금지 |
| 공통 로그 | job_type | 작업 종류 | string | data_fetch_logs | job_type | 필수 | catalog 값 사용 |
