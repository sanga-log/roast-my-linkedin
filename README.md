# 👵 할미떼 — AI 할미의 매운맛 LinkedIn 팩폭

> "열정적인", "Growth Mindset", "시너지"... 그런 말 쓰면 할미가 혼내줄 거여잉 👊

LinkedIn 프로필 URL만 넣으면 **AI 할머니 캐릭터**가 오글거리는 표현을 찾아내 팩폭해주는 바이럴 웹앱입니다.
한국식 "라떼는~" 감성에 미떼 핫초코 무드를 입힌 **할미떼** 브랜드.

<br>

## ✨ 이런 걸 할 수 있어요

| 기능 | 설명 |
|------|------|
| 🔗 **URL 분석** | LinkedIn URL 입력 → 4개 API로 자동 스크래핑 → 즉시 분석 |
| 📋 **PDF 업로드** | PC에서 LinkedIn → 더보기 → PDF로 저장한 파일 업로드 |
| 📸 **스크린샷 업로드** | 모바일에서 프로필 정보 섹션 캡처 후 업로드 |
| 🔥 **오글 점수** | 0~100점 SVG 게이지로 오글거림 시각화 |
| 👊 **할미 팩폭** | "~이여", "~봐라잉" 말투로 거침없는 피드백 |
| 💡 **개선 팁** | 실제로 도움 되는 프로필 개선 포인트 3가지 |
| 😈 **공유하기** | "이 팩폭을 동료한테 공유하기" |

<br>

## 🎭 사용자 흐름

```
① 랜딩 — URL 입력 후 "혼내줘 →" 클릭 (또는 PDF/스크린샷으로 바로 시작)
     ↓
② 스크래핑 — "할미가 안경 쓰고 접속 중..." (4개 RapidAPI 순차 시도)
     ↓
  ┌──────────────────┬──────────────────────────────┐
  │ ✅ 성공           │ ❌ 실패 (403/봇 감지 등)       │
  │ → 바로 분석으로   │ → "그럴 줄 알고 준비해뒀지 👵" │
  │                   │ → PDF/스크린샷 업로드 안내     │
  └──────────────────┴──────────────────────────────┘
     ↓
③ AI 분석 로딩 — "오글 단어 족보 확인 중..." 등 5단계 메시지
     ↓
④ 결과 — 오글 점수 게이지 + 클리셰 뱃지 + 할미 팩폭 + 개선 팁
```

> **Fallback 전략**: 4개 RapidAPI 순차 시도 → 429/401/403 발생 시 자동으로 다음 API → 모두 실패하면 업로드 안내
> **API 과부하**: Claude API 429/529 응답도 차단 화면으로 안내

<br>

## 🏗️ 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일 | Inline styles + CSS 변수/애니메이션 |
| AI | Claude API (`claude-sonnet-4-20250514`) |
| 배포 | Vercel |

<br>

## 📁 프로젝트 구조

> [토스 Frontend Fundamentals](https://frontend-fundamentals.com) 기반 — 파일 종류가 아니라 **도메인(화면) 단위**로 응집

```
app/
├── page.tsx                    # 상태 머신 + 화면 라우팅
├── layout.tsx                  # 루트 레이아웃 + OG 메타
├── globals.css                 # CSS 변수, 애니메이션
│
├── components/                 # 전역 공유 UI
│   ├── HalmiSpinner.tsx
│   └── AnimatedCount.tsx
│
├── domains/                    # 화면별 도메인
│   ├── landing/                #   랜딩
│   ├── scraping/               #   스크래핑 로딩
│   ├── blocked/                #   차단/할당량 초과
│   ├── upload/                 #   파일 업로드 (+ UploadZone)
│   ├── loading/                #   AI 분석 로딩
│   ├── result/                 #   결과 (+ CringeGauge)
│   └── error/                  #   에러
│
├── lib/
│   └── types.ts                # 전역 공유 타입
│
└── api/
    ├── roast/route.ts          # Claude API 호출
    └── scrape/route.ts         # LinkedIn 스크래핑 (4개 API fallback)
```

<br>

## 🚀 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# → .env.local에 API 키 입력 (아래 환경변수 섹션 참고)

# 개발 서버 실행
npm run dev
# → http://localhost:3000
```

### Vercel 배포

```bash
npm i -g vercel   # 최초 1회
vercel             # 배포 실행
```

환경변수는 Vercel 대시보드 → **Settings → Environment Variables**에서 추가합니다.

<br>

## 📝 환경변수

| 변수명 | 설명 | 필수 |
|--------|------|:----:|
| `ANTHROPIC_API_KEY` | Anthropic API 키 | ✅ |
| `RAPIDAPI_KEY` | RapidAPI 키 (LinkedIn 스크래핑) | ✅ |
| `KV_REST_API_URL` | Upstash Redis REST URL | |
| `KV_REST_API_TOKEN` | Upstash Redis REST 토큰 | |

> `KV_REST_API_*` 미설정 시 통계는 0으로 표시됩니다. [Upstash](https://upstash.com)에서 무료 Redis를 만들 수 있어요.

### RapidAPI 설정 방법

1. [RapidAPI](https://rapidapi.com) 계정 생성
2. 아래 4개 API의 **Free Plan** 구독 (하나의 키로 모두 사용 가능):
   - [Fresh LinkedIn Profile Data](https://rapidapi.com/freshdata-freshdata-default/api/fresh-linkedin-profile-data)
   - [LinkedIn Data API / RockAPIs](https://rapidapi.com/rockapis-rockapis-default/api/linkedin-data-api)
   - [LinkedIn Profile & Company Data / ParallelNeuron](https://rapidapi.com/parallelneuron-parallelneuron-default/api/linkedin-profile-and-company-data-api)
   - [Fresh LinkedIn Scraper API](https://rapidapi.com/freshdata-freshdata-default/api/fresh-linkedin-profile-data)
3. 발급받은 API 키를 `.env.local`의 `RAPIDAPI_KEY`에 입력

<br>

## 🤖 오글 점수 기준

할미가 잡아내는 **9가지 클리셰 패턴**:

| # | 패턴 | 예시 |
|---|------|------|
| 1 | 클리셰 단어 | Growth Mindset, 열정적인, 시너지 |
| 2 | Humble brag | "humbled to announce", "영광입니다" |
| 3 | 공허한 문장 | "다양한 경험", "가치를 창출" |
| 4 | 스타트업 용어 남발 | pivot, disrupt, leverage |
| 5 | 숫자 없는 성과 | "매출을 올렸습니다" (얼마나?) |
| 6 | 어색한 한영혼용 | "Proactive한 자세" |
| 7 | 자기계발서 문체 | "한계를 넘어", "끊임없이 성장" |
| 8 | 범용 복붙 문장 | 어디서나 쓸 수 있는 무의미한 말 |
| 9 | 당연한 스킬 나열 | 커뮤니케이션, 팀워크, 성실함 |

### 점수 판정

| 점수 | 할미 반응 |
|------|-----------|
| 0 – 30 | 나쁘지 않구먼 👵 |
| 31 – 55 | 할미가 쯧쯧 😤 |
| 56 – 75 | 아이구야 이걸 💀 |
| 76 – 100 | 할미 눈물 난다 😭 |

<br>

## 🎨 디자인 토큰

```css
--halmi: #8b4513;       /* 할미 갈색 */
--halmi-gold: #daa520;  /* 금빛 강조 */
--char: #0d0d0d;        /* 배경 (숯) */
--text: #f5f0e8;        /* 따뜻한 흰색 */
--text-dim: #a09070;    /* 보조 텍스트 */
```

**애니메이션**: `wobble`(할미 흔들흔들) · `slideUp`(컨텐츠 등장) · `pop`(뱃지 등장) · `bounceIn`(버튼 등장) · `spin`(로딩)

<br>

## ⚠️ API 할당량 처리

```
Claude API 429 (Rate limit)  ┐
Claude API 529 (Overloaded)  ├─→ { blocked: true } → 차단 화면
기타 API 오류                ┘

→ "할미떼가 너무 인기가 많아서 잠깐 쉬어야 해잉~"
```

<br>

---

<p align="center">
  🍫 <em>동서식품 담당자님 보고 계세여? 할미떼 × 미떼 콜라보 어떻겄어잉~</em> 💛
</p>
