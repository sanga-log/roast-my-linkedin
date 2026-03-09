<p align="center">
  <img src="public/halmi.png" alt="할미떼" width="160" />
</p>

<h1 align="center">할미떼</h1>
<p align="center"><strong>AI 할미의 매운맛 LinkedIn 충고</strong></p>
<p align="center">
  <em>"성장하는", "임팩트", "자기주도적"... 그런 말 쓰면 할미가 가만 안 둔당께 👊</em>
</p>

<br>

## 뭐하는 서비스여?

LinkedIn 프로필을 넣으면 **충청도 할머니 AI**가 오글거리는 허세 표현을 찾아내서 팩폭해주는 웹앱이여.

- **URL 입력** → 8개 API 자동 스크래핑 → 즉시 분석
- **PDF/스크린샷 업로드** → 이미지 분석으로 팩폭
- **오글 점수** 0~100점 게이지 + 허세 단어 뱃지 + 할미 충고 + 개선 팁

<br>

## 사용자 흐름

```
① 랜딩 — URL 입력 or PDF/스크린샷 업로드
     ↓
② 스크래핑 — 8개 RapidAPI 순차 시도
     ↓
  ┌─────────────┬──────────────────────────┐
  │ ✅ 성공      │ ❌ 전부 실패              │
  │ → 바로 분석  │ → PDF/스크린샷 업로드 안내 │
  └─────────────┴──────────────────────────┘
     ↓
③ AI 분석 — Gemini 2.5 Flash가 충청도 할미로 변신
     ↓
④ 결과 — 오글 점수 + 허세 단어 + 매운맛 충고 + 팁 + 할미 응원
```

<br>

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| AI | Google Gemini 2.5 Flash |
| 스크래핑 | RapidAPI (8개 API fallback chain) |
| 에러 모니터링 | Sentry |
| 알림 | Slack Webhook (사용자 로그 + 피드백) |
| 배포 | Vercel |

<br>

## 프로젝트 구조

> [토스 Frontend Fundamentals](https://frontend-fundamentals.com) 기반 — 도메인(화면) 단위로 응집

```
app/
├── page.tsx                    # 상태 머신 + 화면 라우팅
├── layout.tsx                  # 루트 레이아웃 + OG 메타
├── globals.css                 # CSS 변수, 애니메이션
├── global-error.tsx            # React 에러 → Sentry 전송
│
├── components/                 # 전역 공유 UI
│   ├── HalmiSpinner.tsx
│   └── AnimatedCount.tsx
│
├── domains/                    # 화면별 도메인
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
    └── stats/route.ts          # 통계 API

instrumentation.ts              # Sentry 서버/엣지 초기화
instrumentation-client.ts       # Sentry 클라이언트 초기화
```

<br>

## 시작하기

```bash
npm install
npm run dev
# → http://localhost:3000
```

### Vercel 배포

Vercel 대시보드에서 GitHub 레포 연결 후, **Settings → Environment Variables**에 환경변수 등록.

<br>

## 환경변수

| 변수명 | 설명 |
|--------|------|
| `GEMINI_API_KEY` | Google Gemini API 키 |
| `RAPIDAPI_KEY` | RapidAPI 키 (LinkedIn 스크래핑) |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN |
| `SENTRY_ORG` | Sentry 조직명 |
| `SENTRY_PROJECT` | Sentry 프로젝트명 |
| `SLACK_WEBHOOK_USER_LOG` | Slack Webhook URL |

<br>

## 오글 점수 기준

### 할미의 발작 버튼 8가지

| 유형 | 예시 |
|------|------|
| 성장 집착형 | "매일 성장하는", "러닝 커브", "자기주도적" |
| 혁신/문제해결 허세형 | "임팩트", "가치 창출", "인사이트" |
| 소통/협업 교과서형 | "원활한 커뮤니케이션", "오너십", "드리븐" |
| 겸손한 척 자랑형 | "감사하게도", "운 좋게도", "humbled to" |
| 스타트업 용어 남발형 | "애자일", "그로스", "MVP", "피봇" |
| 숫자 없는 성과형 | "매출을 성장시켰습니다" (얼마나?) |
| 뻔한 자기소개형 | "더 나은 세상을 만들고 싶은", "다양한 경험" |
| 당연한 스킬 나열형 | 커뮤니케이션, 팀워크, 리더십, 성실함 |

### 점수 판정

| 점수 | 할미 반응 |
|------|-----------|
| 0 – 19 | 어? 니 프로필 괜찮구먼! 할미가 인정이여 👵 |
| 20 – 39 | 쯧, 좀 오글거리긴 하는데 봐줄만 하구먼 😏 |
| 40 – 59 | 아이구~ 할미 손발이 슬슬 오그라드는겨 🫣 |
| 60 – 79 | 거 참, 이 프로필 쓸 때 부끄럽지 않았어유? 💀 |
| 80 – 100 | 할미가 이걸 보고 밥을 못 먹겠어유... 😭 |

<br>

---

<p align="center">
  👵 <em>할미가 싫은소리 많이 했지만 말이여, 니는 충분히 잘하고 있는 사람이여.</em> 💛
</p>
