# Supabase 정규화 후보

이 문서는 실제 테이블을 확정하는 마이그레이션이 아니라 PoC 샘플 검증을 위한 후보입니다.
원본 응답 전문은 운영 DB에 저장하지 않고 필요한 필드만 타입과 의미를 확인해 저장합니다.

## unique 및 primary unique 후보

| 테이블 | 후보 키 | 전제 및 검증 항목 |
| --- | --- | --- |
| `races` | `racecourse_id + race_date + race_no` | 경마장 코드와 날짜의 표준화 필요 |
| `race_entries` | `race_id + horse_id` | 한 경주에서 같은 말의 중복 출전이 없는지 검증 |
| `race_results` | `race_id + horse_id` | 순위 변경 시 동일 행 upsert 가능해야 함 |
| `dividends` | `race_id + bet_type + combination` | 조합 번호 정렬 및 구분자 규칙 필요 |
| `horses` | `country + horse_no` | horse_no의 국가·API 간 안정성 확인 |
| `jockeys` | `country + jockey_no` | jockey_no가 변경 API에도 제공되는지 확인 |
| `trainers` | `country + trainer_no` | trainer_no의 API 간 안정성 확인 |

## 테이블별 후보 필드

- `racecourses`: `country`, `source_code`, `name`
- `races`: `racecourse_id`, `race_date`, `race_no`, `distance_m`, `grade`,
  `scheduled_start_at`, `official_status`, `source_updated_at`
- `horses`: `country`, `horse_no`, `name`, `birth_date`, `sex`, `origin`
- `jockeys`: `country`, `jockey_no`, `name`, `racecourse_code`
- `trainers`: `country`, `trainer_no`, `name`, `racecourse_code`
- `race_entries`: `race_id`, `horse_id`, `entry_no`, `jockey_id`, `trainer_id`,
  `assigned_weight`, `horse_weight`, `horse_weight_change`, `cancelled_at`,
  `cancellation_reason`, `needs_review`
- `race_results`: `race_id`, `horse_id`, `finish_position`, `race_time`,
  `margin`, `result_status`, `confirmed_at`
- `dividends`: `race_id`, `bet_type`, `combination`, `payout_rate`,
  `official_status`, `confirmed_at`
- `data_fetch_logs`: 기존 타입 필드와 `endpoint_name`, `http_status`,
  `sample_path`; 인증 값과 요청 URL 전체는 제외

## 불안정 식별자 처리

`horse_no`, `jockey_no`, `trainer_no`가 없거나 API마다 다르면 이름만으로 자동 병합하지
않습니다. 후보 레코드에 `needs_review = true`를 설정하고 다음 근거를 함께 저장합니다.

- 원본 API 구분과 확인 날짜
- 이름, 소속, 국가, 생년 등 비교 가능한 비식별 속성
- 충돌한 번호 목록
- 사람이 검토한 상태와 검토 시각

검토가 끝나기 전에는 기존 엔터티 ID에 자동 연결하지 않아 동명이인이나 번호 체계 차이로
인한 잘못된 병합을 방지합니다.

## upsert 전 검증

1. 같은 요청을 두 번 실행해 행 수가 늘지 않는지 확인합니다.
2. 결과 확정 전후에 같은 unique 키로 필요한 필드만 갱신되는지 확인합니다.
3. null이 기존 확정값을 덮어쓰지 않도록 업데이트 정책을 정합니다.
4. 경주번호와 출주번호, 마번을 혼동하지 않는지 샘플로 검증합니다.
5. 배당 조합의 순서가 의미를 가지는 승식을 구분합니다.
