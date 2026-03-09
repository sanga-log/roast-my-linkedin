# Project Rules

## README 동기화 규칙

코드를 수정한 후에는 반드시 README.md를 검토하고, 아래 항목이 변경되었으면 README에도 반영한다:

- 환경변수 추가/변경
- 새로운 기능 추가
- 설치/실행 방법 변경
- API 연동 변경
- 파일 구조 변경

## 커밋 메시지 컨벤션 (Conventional Commits)

```
<타입>(<범위>): <설명>

[본문(선택)]

[꼬리말(선택)]
```

### 타입

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `refactor`: 코드 리팩토링 (기능 변경 없음)
- `style`: 코드 포맷팅, 세미콜론 누락 등 (코드 변경 없음)
- `docs`: 문서 수정
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드, 패키지 매니저, 설정 변경
- `perf`: 성능 개선
- `ci`: CI/CD 관련 변경

### 규칙

- 제목은 50자 이내, 한국어로 작성
- 제목 끝에 마침표 사용하지 않음
- 본문은 "무엇을/왜" 중심으로 작성

### 예시

```
feat(scrape): LinkedIn 프로필 스크래핑 fallback chain 구현
fix(roast): API 할당량 초과 시 blocked 화면 미노출 수정
refactor(page): 업로드 화면 컴포넌트 분리
chore: 환경변수 RAPIDAPI_KEY 추가
docs: README에 스크래핑 API 설정 방법 추가
```

## 폴더 구조

### 핵심 원칙: "함께 수정되는 코드를 같은 디렉토리에"

- 로직의 종류(components/hooks/utils)가 아닌 **맥락과 책임(도메인)** 기준으로 분리
- 디렉토리 구조를 재귀적으로 구성하여 코드 의존성을 명확히 드러냄
- 여러 도메인에서 공유하는 코드만 전역(components/, lib/)에 배치
- 특정 도메인에서만 쓰는 코드는 해당 도메인 폴더 안에 응집

### 프로젝트 구조

```
app/
  components/           # 전역 공유 UI (2개 이상 도메인에서 사용)
    HalmiSpinner.tsx
    AnimatedCount.tsx
  domains/              # 화면/기능 도메인 (함께 수정되는 코드 응집)
    landing/
      LandingScreen.tsx
    scraping/
      ScrapingScreen.tsx
    blocked/
      BlockedScreen.tsx
    upload/
      UploadScreen.tsx
      UploadZone.tsx    # upload 도메인 전용
    loading/
      LoadingScreen.tsx
    result/
      ResultScreen.tsx
      CringeGauge.tsx   # result 도메인 전용
    error/
      ErrorScreen.tsx
  lib/                  # 전역 공유 유틸/타입
    types.ts
  api/
    roast/route.ts
    scrape/route.ts
  page.tsx              # 상태 머신 + 화면 라우팅 (오케스트레이터)
  layout.tsx
  globals.css
```

### 파일 배치 판단 기준

| 질문                     | 배치                                               |
| ------------------------ | -------------------------------------------------- |
| 여러 도메인에서 사용?    | `components/` 또는 `lib/`                          |
| 특정 화면에서만 사용?    | 해당 `domains/{화면}/` 안에 응집                   |
| 새 도메인 추가?          | `domains/{도메인명}/` 폴더 생성                    |
| 도메인 내 코드가 커지면? | 도메인 안에 `components/`, `hooks/` 하위 폴더 생성 |

## 코드 컨벤션

### 가독성 (Readability)

- 매직 넘버에 이름 붙이기: `const ANIMATION_DELAY_MS = 300` (하드코딩 X)
- 복잡한 조건문은 의미있는 변수명으로 추출
- 중첩 삼항 연산자 대신 if/else 또는 IIFE 사용
- 관련 로직은 가까이 배치 (위→아래로 읽히도록)

### 예측 가능성 (Predictability)

- 함수는 이름이 암시하는 동작만 수행 (숨겨진 부수효과 금지)
- 유사 함수의 반환 타입 통일
- 래퍼/유틸리티에는 구체적이고 고유한 이름 사용

### 응집도 (Cohesion)

- 기능/도메인 단위로 코드 구조화 (파일 타입별 X)
- 상수는 관련 로직 근처에 정의
- 폼 검증은 요구사항에 맞게 field-level / form-level 선택

### 결합도 (Coupling)

- 분기가 예상되면 섣부른 추상화보다 중복 허용
- 넓은 상태를 작은 단위 훅/컨텍스트로 분리
- Props drilling 대신 컴포지션 패턴 사용
