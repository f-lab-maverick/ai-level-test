# AI 레벨테스트

F-Lab 예비 멘티 대상 AI 활용 역량 진단 테스트입니다.

25문항을 풀고 Lv1~Lv6 중 본인 레벨을 확인할 수 있습니다.

## 링크

- 테스트: https://f-lab-maverick.github.io/ai-level-test
- 관리자: https://f-lab-maverick.github.io/ai-level-test/admin

## 로컬 실행

`index.html` 파일을 브라우저에서 열어주세요.

## 레벨 설정

| 레벨 | 이름 | 정답 수 | 설명 |
|------|------|---------|------|
| Lv1 | AI 활용자 | 0~7개 | 단순 GPT 사용 |
| Lv2 | AI 기능 구현자 | 8~12개 | LLM API 사용 가능 |
| Lv3 | AI 데이터 통합자 | 13~16개 | 임베딩/벡터/Retrieval Pipeline 구현 |
| Lv4 | AI 시스템 설계자 | 17~20개 | Prompt Chain/Context Flow 조합 |
| Lv5 | AI 에이전트 엔지니어 | 21~23개 | Tool Calling/Memory/Graph 기반 자율 모델 |
| Lv6 | AI 프로덕트 아키텍트 | 24~25개 | Fine-tuning/안전시스템/멀티모달 통합 설계 |

## 문항 배점

| 레벨 | 문항 수 |
|------|---------|
| AI 활용자 | 3문항 |
| AI 기능 구현자 | 5문항 |
| AI 데이터 통합자 | 5문항 |
| AI 시스템 설계자 | 7문항 |
| AI 에이전트 엔지니어 | 3문항 |
| AI 프로덕트 아키텍트 | 2문항 |

## 구조

- `index.html` - 테스트 페이지
- `result.html` - 결과 페이지
- `app.js`, `result.js` - 로직
- `f-lab-ai-test-questions.json` - 문항 데이터
- `level-config.json` - 레벨 설정
