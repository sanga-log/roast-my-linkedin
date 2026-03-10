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

- **🔗 URL 입력** — 8개 API 자동 fallback 스크래핑으로 프로필을 가져와 즉시 분석
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
   └─ 8개 RapidAPI를 순차적으로 시도
       ├─ 성공 → AI 분석으로 이동
       └─ 전부 실패 → "이럴 줄 알고 할미가 다~ 준비해뒀당께" → PDF/스크린샷 업로드로 안내

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
| 스크래핑      | RapidAPI (8개 API fallback chain)    |
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
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis REST URL (통계 저장) |  ✅  |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST 토큰            |  ✅  |
| `NEXT_PUBLIC_SENTRY_DSN`   | Sentry DSN                         |      |
| `SENTRY_ORG`               | Sentry 조직명                      |      |
| `SENTRY_PROJECT`           | Sentry 프로젝트명                  |      |
| `SLACK_WEBHOOK_USER_LOG`   | Slack Webhook URL (사용 로그)      |      |

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

### 배포

Vercel 대시보드에서 GitHub 레포를 연결하면 `main` 브랜치에 push할 때마다 자동 배포됩니다. **Settings → Environment Variables**에서 필수 환경변수를 먼저 등록해야 정상 동작합니다.

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
│   └── slack.ts                # Slack 알림 유틸
│
└── api/
    ├── roast/route.ts          # Gemini API 호출
    ├── scrape/route.ts         # LinkedIn 스크래핑 (8개 API fallback)
    ├── feedback/route.ts       # 피드백 → Slack 전송
    └── stats/route.ts          # 통계 API (Upstash Redis)

instrumentation.ts              # Sentry 서버/엣지 초기화
instrumentation-client.ts       # Sentry 클라이언트 초기화
```

### 상태 머신 구조

`page.tsx`에서 7개 화면을 상태 머신 패턴으로 관리합니다. 화면 타입은 `lib/types.ts`에 정의되어 있고, 이 서비스는 단계별로 순차 진행되는 흐름이라 URL 라우팅 대신 상태 머신이 더 적합하다고 판단했습니다.

```typescript
// lib/types.ts
type Screen = 'landing' | 'scraping' | 'blocked' | 'upload' | 'loading' | 'result' | 'error'

// page.tsx 흐름
// landing → scraping → (성공) → loading → result
//                    → (실패) → blocked → upload → loading → result
```

<br>

## 스크래핑 Fallback Chain

URL 입력 시 아래 8개 RapidAPI를 순서대로 시도합니다. 하나라도 성공하면 즉시 AI 분석으로 넘어가고, 전부 실패하면 "이럴 줄 알고 할미가 다~ 준비해뒀당께" 화면이 나타나면서 PDF/스크린샷 업로드를 안내합니다.

> LinkedIn은 봇 접근을 철저하게 차단합니다. 429(할당량 초과)든 403(차단)이든 동일하게 처리하며, 차단 자체가 에러가 아니라 서비스 스토리의 일부가 되도록 설계했습니다.

| 순서 | API 이름                          |
| :--: | --------------------------------- |
|  1   | Unlimited LinkedIn Scraper        |
|  2   | Z-LinkedIn API                    |
|  3   | Li Data Scraper                   |
|  4   | LinkedIn Person Profile Scraper   |
|  5   | Fresh LinkedIn Scraper            |
|  6   | LinkedIn Scraper (Real-Time Fast) |
|  7   | Fresh LinkedIn Profile Data API   |
|  8   | LinkedIn Data Scraper             |

> 모든 API는 하나의 `RAPIDAPI_KEY`로 무료 구독하여 사용합니다.

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

에러는 Sentry로 수집하고, Sentry에서 Slack `#error-log` 채널로 자동 알림을 보냅니다. 정상적인 사용 로그는 Slack Webhook으로 별도 채널에 기록합니다.

```
👵 팩폭 완료!
• 오글 점수: 72/100 (부끄럽지 않았어유? 💀)
• 허세 단어: 성장하는, 임팩트, 커뮤니케이션
• 분석 방식: URL 스크래핑
```

DB나 어드민 패널 없이 Slack 하나로 활동 로그, 피드백, 에러 알림을 모두 처리합니다.

<br>
