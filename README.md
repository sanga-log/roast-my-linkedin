<p align="center">
  <img src="public/halmi.png" alt="할미떼" width="160" />
</p>

<h1 align="center">할미떼</h1>
<p align="center"><strong>AI 할미의 매운맛 LinkedIn 충고</strong></p>
<p align="center">
  <em>"성장하는", "임팩트", "자기주도적"... 그런 말 쓰면 할미가 가만 안 둔당께 👊</em>
</p>

<p align="center">
  <a href="https://roast-my-linkedin-ten.vercel.app">🔗 서비스 바로가기</a>
</p>

<br>

## 이게 뭔가요?

LinkedIn 프로필을 넣으면 **충청도 할머니 AI**가 오글거리는 허세 표현을 찾아내서 팩폭해주는 웹앱입니다!

해외에서 "Roast My Strava" 같은 AI 팩폭 서비스가 유행하는 걸 보고 영감을 받았습니다. 한국은 아직 LinkedIn 버전이 없길래 한국스럽게 충청도 할미 컨셉으로 만들어보았습니다. 🇰🇷

<br>

## 주요 기능

- **🔗 URL 입력** — 10개 API 자동 fallback 스크래핑으로 프로필을 가져와 즉시 분석
- **📄 PDF/스크린샷 업로드** — AI Vision으로 이미지를 직접 읽어서 팩폭
- **📊 오글 점수** — 0~100점 게이지 + 허세 단어 뱃지 + 할미 충고 + 개선 팁
- **💬 피드백 시스템** — Slack Webhook으로 사용자 피드백 실시간 수신
- **📈 사용 통계** — Upstash Redis 기반 누적 카운트

<br>

## 사용자 흐름

```
① 랜딩
   └─ LinkedIn URL 입력

② 스크래핑
   └─ 10개 RapidAPI를 순차적으로 시도
       ├─ 성공 → AI 분석으로 이동
       └─ 전부 실패
            ├─ 10개 모두 할당량 초과(429) → "할미떼가 너무 인기가 많아부러서 요청 한도를 넘겨부렀어유~"
            └─ 스크래핑 차단 → "LinkedIn이 할미 못 들어오게 막아부렀어유~"
            └─ "이럴 줄 알고 할미가 다~ 준비해뒀당께" → PDF/스크린샷 업로드로 안내

③ AI 분석
   └─ Gemini 2.5 Flash가 충청도 할미로 변신
       └─ cringeScore, detectedWords, roastText, tips를 구조화된 JSON으로 반환

④ 결과
   └─ 오글 점수 게이지 + 허세 단어 뱃지 + 매운맛 충고 + 개선 팁 + 할미 응원
```

<br>

## 기술 스택

| 항목          | 내용                                 |
| ------------- | ------------------------------------ |
| 프레임워크    | Next.js 14 (App Router)              |
| 언어          | TypeScript                           |
| AI            | Google Gemini 2.5 Flash              |
| 스크래핑      | RapidAPI (10개 API fallback chain)   |
| 통계 저장     | Upstash Redis                        |
| 에러 모니터링 | Sentry                               |
| 알림          | Slack Webhook (사용자 로그 + 피드백) |
| 배포          | Vercel                               |

<br>

## 환경변수

| 변수명                     | 설명                               | 필수 |
| -------------------------- | ---------------------------------- | :--: |
| `GEMINI_API_KEY`           | Google Gemini API 키               |  ✅  |
| `RAPIDAPI_KEY`             | RapidAPI 키 (LinkedIn 스크래핑)    |  ✅  |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis REST URL (통계·이벤트 기록) |  ✅  |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST 토큰            |  ✅  |
| `NEXT_PUBLIC_SENTRY_DSN`   | Sentry DSN                         |      |
| `SENTRY_ORG`               | Sentry 조직명                      |      |
| `SENTRY_PROJECT`           | Sentry 프로젝트명                  |      |
| `SLACK_WEBHOOK_USER_LOG`   | Slack Webhook URL (사용 로그)      |      |
| `SLACK_WEBHOOK_ERROR_LOG`  | Slack Webhook URL (서버 에러 알림, `#error-log`) |      |

<br>

## 시작하기

### 로컬 실행

```bash
git clone https://github.com/sanga-log/roast-my-linkedin.git
cd roast-my-linkedin
npm install
npm run dev
# → http://localhost:3000
```

### 환경변수 설정

Vercel에 연결된 프로젝트라면 아래 명령어로 환경변수를 한 번에 가져올 수 있습니다.

```bash
vercel env pull .env.local
```

직접 설정하려면 위의 [환경변수](#환경변수) 표를 참고해서 `.env.local` 파일을 생성합니다.

<br>

## 프로젝트 구조

> **"함께 수정되는 코드를 같은 디렉토리에"** 원칙으로 도메인(화면) 단위로 응집

```
app/
├── page.tsx                    # 상태 머신 + 화면 라우팅
├── layout.tsx                  # 루트 레이아웃 + OG 메타
├── globals.css                 # CSS 변수, 애니메이션
├── global-error.tsx            # React 에러 → Sentry 전송
│
├── components/                 # 전역 공유 UI (2개 이상 도메인에서 사용)
│   ├── HalmiSpinner.tsx
│   └── AnimatedCount.tsx
│
├── domains/                    # 화면별 도메인 (함께 수정되는 코드 응집)
│   ├── landing/                #   랜딩
│   ├── scraping/               #   스크래핑 로딩
│   ├── blocked/                #   차단/할당량 초과
│   ├── upload/                 #   파일 업로드
│   ├── loading/                #   AI 분석 로딩
│   ├── result/                 #   결과 (+ CringeGauge)
│   └── error/                  #   에러
│
├── lib/
│   ├── types.ts                # 전역 공유 타입
│   ├── slack.ts                # Slack 알림 유틸
│   ├── redis.ts                # Upstash Redis 클라이언트, 운영 환경 판별
│   ├── events.ts               # 사용 이벤트 기록 (Redis)
│   ├── errorAlert.ts           # 서버 에러 → Slack 직접 알림 (1시간 1회)
│   └── rateLimit.ts            # IP당 요청 제한
│
└── api/
    ├── roast/route.ts          # Gemini API 호출
    ├── scrape/route.ts         # LinkedIn 스크래핑 (10개 API fallback)
    ├── feedback/route.ts       # 피드백 → Slack 전송
    └── stats/route.ts          # 통계 API (Upstash Redis)

instrumentation.ts              # Sentry 서버/엣지 초기화
instrumentation-client.ts       # Sentry 클라이언트 초기화
```

### 상태 머신 구조

`page.tsx`에서 7개 화면을 상태 머신 패턴으로 관리합니다. 화면 타입은 `lib/types.ts`에 정의되어 있고, 이 서비스는 단계별로 순차 진행되는 흐름이라 URL 라우팅 대신 상태 머신이 더 적합하다고 판단했습니다.

```typescript
// lib/types.ts
type Screen =
  | "landing"
  | "scraping"
  | "blocked"
  | "upload"
  | "loading"
  | "result"
  | "error";

// page.tsx 흐름
// landing → scraping → (성공) → loading → result
//                    → (실패) → blocked → upload → loading → result
```

<br>

## 스크래핑 Fallback Chain

URL 입력 시 아래 10개 RapidAPI를 순서대로 시도합니다. 하나라도 성공하면 즉시 AI 분석으로 넘어가고, 전부 실패하면 "이럴 줄 알고 할미가 다~ 준비해뒀당께" 화면이 나타나면서 PDF/스크린샷 업로드를 안내합니다.

> LinkedIn은 봇 접근을 철저하게 차단합니다. 차단 사유에 따라 다른 메시지를 보여줍니다:
> - **10개 모두 429 할당량 초과** → "할미떼가 너무 인기가 많아부러서 요청 한도를 넘겨부렀어유~"
> - **그 밖의 실패(403 차단·빈 결과·타임아웃이 하나라도 섞임)** → "LinkedIn이 할미 못 들어오게 막아부렀어유~"
> - **429 요청 횟수 초과 (IP당 1시간 7번)** → "너무 자주 찾아와부렀어유~"
>
> 차단 자체가 에러가 아니라 서비스 스토리의 일부가 되도록 설계했습니다.

| 순서 | API 이름                                        | RapidAPI host                                           | 무료 한도 | 2026-11-09 확인 |
| :--: | ----------------------------------------------- | ------------------------------------------------------- | --------: | --------------- |
|  1   | LinkedIn Scraper API (Real-time & Fast)         | `linkedin-scraper-api-real-time-fast-affordable`        |   월 50회 | 정상            |
|  2   | LinkedIn Profile Scraper (Profiles)             | `linkedin-profile-scraper11`                            |   월 50회 | 정상            |
|  3   | Unlimited LinkedIn Scraper                      | `unlimited-linkedin-scraper`                            |  월 100회 | 정상            |
|  4   | LinkedIn - Profiles, Companies & Post Search    | `linkedin-profiles-companies-post-search`               |   월 50회 | 정상            |
|  5   | LinkedIn Profile Scraper API                    | `linkedin-profile-scraper-api3`                         |  월 300회 | 정상            |
|  6   | Linkedin Data Scraper API                       | `realtime-linkedin-fresh-data`                          |   월 50회 | 정상            |
|  7   | LinkedIn Scraper API (People Info)              | `linkedin-scraper-api5`                                 |  월 100회 | 정상            |
|  8   | LinkedIn Data API (Profiles)                    | `linkedin-data-api7`                                    |  월 200회 | 정상            |
|  9   | LinkedIn Scraper API [Stable]                   | `linkedin-scraper-api-stable1`                          |   월 50회 | 정상            |
|  10  | Fresh LinkedIn Scraper API                      | `fresh-linkedin-scraper-api`                            |   월 50회 | 정상 (이름·헤드라인만) |

> 모든 API는 하나의 `RAPIDAPI_KEY`로 무료(Basic) 플랜을 구독해 사용합니다. host 뒤에 `.p.rapidapi.com`이 붙습니다. 구독하지 않은 API는 403을 돌려주고 다음 API로 넘어갑니다.
> 무료 한도는 2026-11-09 RapidAPI 요금제 화면 기준이며 바뀔 수 있습니다. 합계 월 1,000회입니다.

<br>

## AI 모델 선택 — Gemini 2.5 Flash

처음에는 Claude Sonnet 4를 사용했습니다. 하지만 바이럴 서비스 특성상 트래픽을 예측할 수 없어서 비용 폭탄의 위험이 있었고, 무료 티어가 넉넉한 Gemini 2.5 Flash로 전환했습니다.

| 요구사항                    | Gemini 2.5 Flash |
| --------------------------- | :--------------: |
| 무료 또는 저렴              |        ✅        |
| 이미지/PDF 멀티모달         |        ✅        |
| 한국어 (충청도 사투리) 성능 |        ✅        |
| JSON 출력 안정성            |        ✅        |

응답은 구조화된 JSON으로 받습니다:

```json
{
  "cringeScore": 72,
  "detectedWords": ["성장하는", "임팩트", "커뮤니케이션"],
  "roastText": "아이구~ 이 프로필 쓸 때 부끄럽지 않았어유?...",
  "tips": ["...", "...", "..."]
}
```

`detectedWords`를 배열로 따로 받기 때문에 결과 화면에서 뱃지로 렌더링할 수 있고, Slack 로그에도 그대로 기록할 수 있습니다.

<br>

## 오글 점수 기준

### 할미의 발작 버튼 8가지

| 유형                 | 예시                                        |
| -------------------- | ------------------------------------------- |
| 성장 집착형          | "매일 성장하는", "러닝 커브", "자기주도적"  |
| 혁신/문제해결 허세형 | "임팩트", "가치 창출", "인사이트"           |
| 소통/협업 교과서형   | "원활한 커뮤니케이션", "오너십", "드리븐"   |
| 겸손한 척 자랑형     | "감사하게도", "운 좋게도", "humbled to"     |
| 스타트업 용어 남발형 | "애자일", "그로스", "MVP", "피봇"           |
| 숫자 없는 성과형     | "매출을 성장시켰습니다" (얼마나?)           |
| 뻔한 자기소개형      | "더 나은 세상을 만들고 싶은", "다양한 경험" |
| 당연한 스킬 나열형   | 커뮤니케이션, 팀워크, 리더십, 성실함        |

### 점수 판정

| 점수     | 할미 반응                                    |
| -------- | -------------------------------------------- |
| 0 – 19   | 어? 니 프로필 괜찮구먼! 할미가 인정이여 👵   |
| 20 – 39  | 쯧, 좀 오글거리긴 하는데 봐줄만 하구먼 😏    |
| 40 – 59  | 아이구~ 할미 손발이 슬슬 오그라드는겨 🫣     |
| 60 – 79  | 거 참, 이 프로필 쓸 때 부끄럽지 않았어유? 💀 |
| 80 – 100 | 할미가 이걸 보고 밥을 못 먹겠어유... 😭      |

<br>

## 모니터링

에러는 Sentry로 수집합니다. Sentry 무료(Developer) 플랜은 Slack 연동을 지원하지 않아서, 서버 에러는 `SLACK_WEBHOOK_ERROR_LOG` 웹훅으로 `#error-log`에 직접 알립니다. 할당량이 바닥나면 모든 요청이 같은 에러를 내므로 같은 에러는 1시간에 한 번만 보냅니다. 브라우저 에러는 Sentry에만 남습니다.

정상적인 사용 로그는 Slack Webhook으로 `#user-log`에 알리고, 같은 내용을 Upstash Redis에도 기록합니다. Slack 무료 플랜은 90일 지난 메시지를 숨기고 1년이 지나면 지우기 때문입니다.

```
👵 팩폭 완료!
• 오글 점수: 72/100 (부끄럽지 않았어유? 💀)
• 허세 단어: 성장하는, 임팩트, 커뮤니케이션
• 분석 방식: URL 스크래핑
```

### 이벤트 기록 (Redis)

운영 환경 이벤트는 `halmi:events` 리스트에 최신순 JSON으로 쌓입니다. 로컬·프리뷰는 `halmi:dev:events`에 따로 쌓입니다. LinkedIn 주소와 IP는 남기지 않습니다.

| type               | 언제                      | 필드                                   |
| ------------------ | ------------------------- | -------------------------------------- |
| `scrape_blocked`   | 스크래핑 차단 화면으로 보낼 때 | `reason`(invalid_url·rate_limited·no_api_key·quota_exhausted·all_apis_exhausted), `hasKoreanUsername` |
| `scrape_succeeded` | 스크래핑 성공             | `scraper`                              |
| `roast_succeeded`  | 팩폭 완료                 | `input`(url·pdf·screenshot), `score`, `detectedWords` |
| `roast_failed`     | 분석 실패                 | `input`, `reason`                      |
| `feedback_sent`    | 피드백 전송               | `message`                              |

Upstash 콘솔 Data Browser나 `LRANGE halmi:events 0 -1`로 볼 수 있습니다.

<br>
