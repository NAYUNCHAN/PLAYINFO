/**
 * 수집 작업의 진행 상태입니다.
 *
 * - queued: 실행 요청을 받았지만 아직 작업을 시작하지 않은 상태
 * - running: 외부 데이터 조회 또는 정규화 작업을 수행 중인 상태
 * - success: 대상 작업 전체가 오류 없이 완료된 상태
 * - failed: 작업을 완료하지 못했고 오류 원인을 확인해야 하는 상태
 * - partial: 여러 대상 중 일부 데이터만 성공하고 나머지는 실패한 상태
 */
export type DataFetchStatus =
  | "queued"
  | "running"
  | "success"
  | "failed"
  | "partial";

/** 예약 실행과 관리자 수동 실행을 구분해 운영 이력을 추적합니다. */
export type DataFetchTriggerType = "scheduled" | "manual";

/**
 * 향후 Supabase `data_fetch_logs` 테이블과 GitHub Actions 실행 기록을 연결할 타입입니다.
 * 날짜·시각 문자열은 API와 DB 사이에서 안전하게 전달할 수 있도록 ISO 문자열을 사용합니다.
 */
export interface DataFetchLog {
  id: string;
  source_name: string;
  job_type: string;
  target_date: string;
  target_racecourse: string | null;
  target_race_no: number | null;
  status: DataFetchStatus;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
  records_inserted: number;
  records_updated: number;
  retry_count: number;
  trigger_type: DataFetchTriggerType;
  github_run_id: string | null;
  github_run_url: string | null;
}
