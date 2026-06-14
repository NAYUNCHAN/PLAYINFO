# KRA API PoC 스크립트

KRA 공공데이터 API의 실제 명세와 응답 형태를 확인하기 위한 독립 실행 스크립트입니다.
현재 endpoint는 확정 전 자리표시자이며, 각 파일의 TODO를 해결한 뒤 사용해야 합니다.

## 입력값

- `KRA_API_KEY`: 필수 인증 키
- `TARGET_DATE`: `YYYYMMDD` 예시 형식
- `RACECOURSE`: `SEOUL`, `BUSAN`, `JEJU` 중 하나
- `RACE_NO`: 경주 번호

```bash
export KRA_API_KEY="발급받은-키"
TARGET_DATE=20260614 RACECOURSE=SEOUL RACE_NO=1 npm run kra:poc:race-info
```

응답은 현재 콘솔에만 출력하며 DB에 저장하지 않습니다. API 검증 후 필요한 필드,
페이지 처리, 경마장 코드와 날짜 형식을 확정하고 정제된 데이터 저장 구조를 설계합니다.
