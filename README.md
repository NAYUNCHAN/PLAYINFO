# Race Note

Race Note는 한국 KRA 공공데이터 API를 중심으로 경마 정보를 정리하고 개인 메모를
관리하기 위한 홈페이지 프로젝트입니다. 일본 JRA 정보는 v1에서 자동으로 DB에
수집하지 않으며, 공식 링크와 수동 메모를 중심으로 다룹니다.

## 제품 원칙

- 데이터 제공 시각에 즉시성을 보장하는 서비스가 아닙니다. 화면에는 `최근 갱신`,
  `공식 결과 대기`, `확정 결과 반영 완료`, `데이터 오래됨`, `수동 확인 필요` 같은
  상태를 사용합니다.
- 베팅 추천 서비스가 아니며 자동 베팅 조합이나 배당 예측 기능을 만들지 않습니다.
- 일본 경마 데이터는 `JRA 공식 페이지에서 확인`하도록 안내하고 자동 수집하지 않습니다.
- KRA 응답 원본 전체를 DB에 보관하지 않고, 검증을 마친 뒤 필요한 필드만 정규화합니다.
- Vercel Hobby, Supabase Free, GitHub Actions 등 무료 범위에서 운영하는 것을 원칙으로 합니다.

## 기술 스택

- Next.js / React / TypeScript
- Tailwind CSS
- Supabase
- Node.js 스크립트
- GitHub Actions

## 개발 순서

1. KRA API PoC
2. Supabase DB/Auth/보존 정책 구축
3. GitHub Actions 수집기 구현
4. 관리자 `workflow_dispatch` 재수집 구현
5. cleanup workflow 구현
6. 홈 화면 HTML 프로토타입
7. 오늘의 경주/경주 상세/결과 화면
8. 관심마/메모 기능
9. 뉴스/JRA 링크 허브
10. 운영 안정화

## 시작하기

TypeScript 직접 실행 기능을 사용하는 Node.js 22 이상이 필요합니다.

```bash
npm install
cp .env.example .env.local
npm run dev
```

### 환경변수

`.env.example`을 복사한 뒤 필요한 값을 설정합니다.

| 변수 | 용도 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 브라우저와 서버가 사용할 Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 브라우저에서 사용할 공개 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 신뢰된 서버 수집기만 사용할 관리자 키 |
| `KRA_API_KEY` | KRA 공공데이터 API 인증 키 |
| `GITHUB_TOKEN` | 향후 Actions 수동 호출에 사용할 GitHub 토큰 |
| `GITHUB_OWNER` | GitHub 저장소 소유자 |
| `GITHUB_REPO` | GitHub 저장소 이름 |

`SUPABASE_SERVICE_ROLE_KEY`와 `KRA_API_KEY`는 브라우저 코드에 노출하지 않습니다.
특히 Service Role Key에는 `NEXT_PUBLIC_` 접두사를 붙이면 안 됩니다. GitHub Actions에서는
저장소의 **Settings → Secrets and variables → Actions**에 `KRA_API_KEY`를 등록합니다.

## KRA API PoC 실행

Node 스크립트는 `.env.local`을 자동으로 읽지 않으므로 셸 환경변수로 키를 전달합니다.
현재 endpoint는 확인 전 자리표시자입니다. 실제 호출 전 각 스크립트의 TODO를 확인하세요.

```bash
export KRA_API_KEY="발급받은-키"
TARGET_DATE=2026-06-14 RACECOURSE=SEOUL RACE_NO=1 npm run kra:poc:race-info
npm run kra:poc:results
npm run kra:poc:dividends
npm run kra:poc:horse-weight
```

### 날짜 형식

- GitHub Actions의 `target_date` 입력은 사람이 읽고 검수하기 쉬운 `YYYY-MM-DD` 형식입니다.
- KRA API 요청 직전에는 날짜 변환 유틸이 값을 `YYYYMMDD` 형식으로 바꿉니다.
- 터미널에서 직접 실행할 때 이미 `YYYYMMDD`를 입력한 경우에도 안전하게 처리합니다.
- 형식이 다르거나 달력에 존재하지 않는 날짜는 외부 API를 호출하기 전에 명확한 오류를 냅니다.

각 요청은 실패 시 10초, 30초, 60초 간격으로 최대 3회 재시도합니다. 현재 결과는
검증을 위해 콘솔에만 출력하고 Supabase에는 저장하지 않습니다.

## GitHub Actions 수동 실행

1. GitHub 저장소의 **Actions** 탭에서 **KRA PoC manual runner**를 선택합니다.
2. **Run workflow**를 누릅니다.
3. `job_type`, `target_date`, `racecourse`, 선택 사항인 `race_no`, `triggered_by`를 입력합니다.
4. 실행 로그에서 입력 조건, 재시도 횟수와 오류 원인을 확인합니다.

GitHub Actions는 정확한 시작 시각을 보장하지 않으므로 이후 화면에는 예약 시각 대신
마지막 성공 시각을 표시합니다. 현재는 수동 실행만 활성화해 과도한 자동 호출을 막습니다.

별도의 **CI** workflow는 Pull Request마다 `npm install`, `npm run lint`, 날짜 변환 테스트,
`npm run build`를 실행합니다. 품질 검증만 수행하며 Vercel 또는 다른 환경으로 배포하지 않습니다.

## 현재 구현된 것

- 최소 Next.js App Router와 Tailwind CSS 설정
- 브라우저용/서버 수집기용 Supabase 클라이언트 골격
- KRA 경주 정보, 결과, 배당, 마체중 PoC 스크립트 골격
- 제한된 횟수와 증가하는 대기 시간을 적용한 retry 유틸
- 향후 `data_fetch_logs` 테이블에 대응할 TypeScript 타입
- 작업 종류를 선택할 수 있는 GitHub Actions 수동 실행 초안

## 아직 구현하지 않은 것

- KRA API endpoint, 요청 파라미터와 응답 스키마 확정
- Supabase 테이블, RLS, Auth와 데이터 보존/정리 정책
- API 응답 정규화 및 DB upsert
- 관리자 화면과 GitHub API 연동
- 실제 서비스 UI, 관심마/메모, 뉴스/JRA 링크 허브
- 일본 JRA 자동 수집, 뉴스 자동 요약, 번역 또는 AI API 연동

## 다음 단계

1. 공공데이터 포털 문서와 샘플 호출로 각 KRA endpoint를 검증합니다.
2. 필요한 필드만 정리한 매핑 문서와 DB 스키마를 작성합니다.
3. Supabase 마이그레이션과 보존 정책을 추가합니다.
4. PoC 코드를 재사용 가능한 수집기와 upsert 로직으로 발전시킵니다.
5. 수집 성공 시각과 실패 원인을 관리자에게 보여 줄 운영 흐름을 설계합니다.
