# 👵 할미떼 — AI 할미의 매운맛 LinkedIn 팩폭

> 할미떼는 말이여~ "열정적인", "Growth Mindset", "시너지"... 그런 말 쓰면 할미가 혼내줄 거여잉 👊  
> 🍫 동서식품 담당자님 보고 계세여? 할미떼 × 미떼 콜라보 어떻겄어잉~ 💛

LinkedIn 프로필을 **AI 할머니 캐릭터**가 팩폭해주는 바이럴 웹앱.  
한국 "라떼는~" 드립 + 미떼 핫초코 라임으로 탄생한 **할미떼** 브랜드.

---

## ✨ 주요 기능

- 🔗 **LinkedIn URL 입력** → 실제 스크래핑 (4개 API fallback chain) → 성공 시 바로 분석 / 실패 시 업로드 안내
- 📋 **PDF 업로드** (PC: LinkedIn → 더보기 → PDF로 저장)
- 📸 **스크린샷 업로드** (모바일: 정보 섹션 캡처)
- 🔥 **오글 점수** 0~100점 SVG 게이지로 시각화
- 👊 **할미 말투 팩폭** — "~이여", "~봐라잉", "아이구야", "할미떼는 말이여~"
- 💡 **개선 팁** 3가지 제공
- 😈 **공유 기능** — "이 팩폭을 동료한테 공유하기"

---

## 🎭 UX 플로우

```
① 랜딩 페이지
   └─ URL 입력 → "혼내줘 →" 클릭
   └─ 또는 PDF/스크린샷으로 바로 시작

② 스크래핑 시도 화면 (로딩 + 실제 API 호출)
   "할미가 안경 쓰고 접속 중..."
   → 4개 RapidAPI 순차 시도 (fallback chain)

③-A 스크래핑 성공 → 바로 AI 분석 로딩으로 이동

③-B 스크래핑 실패 → 차단 화면
   ⛔ 403 Forbidden / Bot detection triggered
   → "그럴 줄 알고 준비해뒀지 👵" reveal
   → PDF/스크린샷 대안 안내

④ 업로드 화면 (차단 시에만)
   PDF(💻 PC) 또는 스크린샷(📱 모바일) 선택

⑤ AI 분석 로딩
   "오글 단어 족보 확인 중..." 등 5단계

⑥ 결과 화면
   오글 점수 게이지 + 탐지된 클리셰 뱃지 + 할미 팩폭 + 팁
```

> **스크래핑 Fallback**: 4개 RapidAPI를 순차 시도 → 429/401/403 시 자동으로 다음 API → 모두 실패 시 업로드 안내
> **API 할당량 초과**: Claude API 429/529도 blocked 화면으로 처리

---

## 🏗️ 기술 스택

| 항목       | 내용                                              |
| ---------- | ------------------------------------------------- |
| 프레임워크 | Next.js 14 (App Router)                           |
| 언어       | TypeScript                                        |
| 스타일     | Inline styles + CSS 변수/애니메이션 (globals.css) |
| AI         | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| 배포       | Vercel                                            |

---

## 📁 파일 구조

```
할미떼/
├── app/
│   ├── page.tsx              # 상태 머신 + 화면 라우팅 (오케스트레이터)
│   ├── layout.tsx            # 루트 레이아웃 + OG 메타데이터
│   ├── globals.css           # CSS 변수, 키프레임 애니메이션
│   ├── components/           # 전역 공유 UI (여러 도메인에서 사용)
│   │   ├── HalmiSpinner.tsx
│   │   └── AnimatedCount.tsx
│   ├── domains/              # 화면 도메인 (토스 FF 기반 응집)
│   │   ├── landing/          # 랜딩 화면
│   │   ├── scraping/         # 스크래핑 로딩
│   │   ├── blocked/          # 차단/할당량 초과
│   │   ├── upload/           # 파일 업로드 (UploadZone 응집)
│   │   ├── loading/          # AI 분석 로딩
│   │   ├── result/           # 결과 (CringeGauge 응집)
│   │   └── error/            # 에러
│   ├── lib/                  # 전역 공유 타입/유틸
│   │   └── types.ts
│   └── api/
│       ├── roast/route.ts    # Claude API 호출
│       └── scrape/route.ts   # LinkedIn 스크래핑 (4개 API fallback)
├── public/
│   └── halmi.png             # 할미 캐릭터 이미지
├── .env.local.example
└── package.json
```

---

## 🚀 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.local.example .env.local
# .env.local 열어서 API 키 입력:
# ANTHROPIC_API_KEY=sk-ant-...
# RAPIDAPI_KEY=your_rapidapi_key

# 3. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

---

## ☁️ Vercel 배포

```bash
# Vercel CLI 설치 (최초 1회)
npm i -g vercel

# 배포
vercel

# 환경변수는 Vercel 대시보드에서 추가
# Settings → Environment Variables
# → ANTHROPIC_API_KEY, RAPIDAPI_KEY
```

---

## 🎨 디자인 시스템

```css
--halmi: #8b4513 /* 할미 갈색 */ --halmi-gold: #daa520 /* 금빛 */
  --char: #0d0d0d /* 배경 (숯) */ --text: #f5f0e8 /* 따뜻한 흰색 */
  --text-dim: #a09070 /* 보조 텍스트 */;
```

**애니메이션**

- `wobble` — 할미 캐릭터 흔들흔들
- `slideUp` — 컨텐츠 등장
- `pop` — 클리셰 뱃지 등장
- `bounceIn` — 버튼 등장
- `spin` — 로딩 스피너

---

## 🤖 AI 팩폭 기준 (9가지 클리셰 패턴)

1. **클리셰 단어** — Growth Mindset, 열정적인, 시너지, Thought Leader
2. **Humble brag** — "humbled to announce", "영광입니다"
3. **공허한 문장** — "다양한 경험", "가치를 창출", "임팩트를 만들어"
4. **스타트업 용어 남발** — pivot, disrupt, leverage, agile
5. **숫자 없는 성과** — "매출을 올렸습니다" (얼마나?)
6. **어색한 한영혼용** — "Proactive한 자세"
7. **자기계발서 문체** — "한계를 넘어", "끊임없이 성장"
8. **범용 복붙 문장** — 어디서나 쓸 수 있는 무의미한 말
9. **당연한 스킬** — 커뮤니케이션, 팀워크, 성실함

**점수 기준**

| 점수     | 판정              |
| -------- | ----------------- |
| 0 – 30   | 나쁘지 않구먼 👵  |
| 31 – 55  | 할미가 쯧쯧 😤    |
| 56 – 75  | 아이구야 이걸 💀  |
| 76 – 100 | 할미 눈물 난다 😭 |

---

## ⚠️ API 할당량 처리

```
Claude API 429 (Rate limit)  ┐
Claude API 529 (Overloaded)  ├─→ { blocked: true } → 차단 화면으로 이동
기타 API 오류                ┘

차단 화면 메시지:
"할미떼가 너무 인기가 많아서 잠깐 쉬어야 해잉~"
```

---

## 📝 환경변수

| 변수명              | 설명                          | 필수 |
| ------------------- | ----------------------------- | ---- |
| `ANTHROPIC_API_KEY`  | Anthropic API 키                | ✅   |
| `RAPIDAPI_KEY`       | RapidAPI 키 (LinkedIn 스크래핑)  | ✅   |
| `KV_REST_API_URL`    | Upstash Redis REST URL          |      |
| `KV_REST_API_TOKEN`  | Upstash Redis REST 토큰          |      |

> **통계 저장**: `KV_REST_API_URL`/`KV_REST_API_TOKEN` 미설정 시 통계는 0으로 표시됩니다. [Upstash](https://upstash.com)에서 무료 Redis DB를 생성하세요.

### RapidAPI 설정
1. [RapidAPI](https://rapidapi.com) 계정 생성
2. 아래 4개 API의 Free Plan 구독 (하나의 키로 모두 사용):
   - [Fresh LinkedIn Profile Data](https://rapidapi.com/freshdata-freshdata-default/api/fresh-linkedin-profile-data)
   - [LinkedIn Data API (RockAPIs)](https://rapidapi.com/rockapis-rockapis-default/api/linkedin-data-api)
   - [LinkedIn Profile & Company Data](https://rapidapi.com/parallelneuron-parallelneuron-default/api/linkedin-profile-and-company-data-api)
   - [Fresh LinkedIn Scraper API](https://rapidapi.com/freshdata-freshdata-default/api/fresh-linkedin-profile-data)
3. API 키를 `.env.local`의 `RAPIDAPI_KEY`에 입력

---

## 🍫 이스터에그

```
🍫 미떼는 말이여~ 동서식품 담당자님 보고 계세여?
할미떼 × 미떼 콜라보 어떻겄어잉~ 💛
```
