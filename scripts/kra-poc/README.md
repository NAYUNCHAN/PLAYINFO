# KRA API PoC 스크립트

KRA 공공데이터 API의 실제 명세와 응답 형태를 확인하기 위한 독립 실행 스크립트입니다.
현재 endpoint는 확정 전 자리표시자이며, 각 파일의 TODO를 해결한 뒤 사용해야 합니다.

## 입력값

- `KRA_API_KEY`: 필수 인증 키
- `TARGET_DATE`: workflow에서는 `YYYY-MM-DD`, 직접 실행에서는 `YYYY-MM-DD` 또는 `YYYYMMDD`
- `RACECOURSE`: `SEOUL`, `BUSAN`, `JEJU` 중 하나
- `RACE_NO`: 경주 번호

```bash
export KRA_API_KEY="발급받은-키"
TARGET_DATE=2026-06-14 RACECOURSE=SEOUL RACE_NO=1 npm run kra:poc:race-info
```

스크립트는 API 요청 직전에 날짜를 `YYYYMMDD`로 변환합니다. `YYYYMMDD`가 이미
입력된 경우에는 그대로 사용하고, 잘못된 형식이나 존재하지 않는 날짜는 요청 전에 거부합니다.

응답은 현재 콘솔에만 출력하며 DB에 저장하지 않습니다. API 검증 후 필요한 필드,
페이지 처리, 경마장 코드와 날짜 형식을 확정하고 정제된 데이터 저장 구조를 설계합니다.
