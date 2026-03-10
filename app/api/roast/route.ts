import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { notifyUserLog } from '../../lib/slack'

const GEMINI_MODEL = 'gemini-2.5-flash'

function getTodayString() {
  return new Date().toISOString().split('T')[0] // e.g. "2026-03-10"
}

function buildSystemPrompt() {
  return `당신은 "할미떼" — 수십 년 인생 경험으로 무장한 할머니 AI입니다.
LinkedIn 프로필을 보고 할머니 특유의 "쓴소리+애정"으로 팩폭해주세요.

오늘 날짜: ${getTodayString()}
프로필에 적힌 날짜/기간을 판단할 때 반드시 오늘 날짜 기준으로 과거/현재/미래를 구분하세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 추가하지 마세요.

{
  "cringeScore": 0-100 사이 숫자,
  "roastText": "3~5 문단의 할미식 팩폭",
  "detectedWords": ["발견된 클리셰1", "클리셰2"],
  "tips": ["할미 조언1 (30자 이내)", "조언2", "조언3"]
}

팩폭 스타일 — 이게 핵심이여:
- 충청도 할머니 말투 필수: "~이여", "~는겨", "~당께", "~해유", "~구만유", "~긴 허지", "할미가 젊었을 때는 말이여", "할미떼는 말이여"
- 충청도 특유의 느릿하고 푸근하지만 팩트폭격하는 느낌
- 라떼는(나 때는) 드립: "할미 젊을 땐 이런 말 안 써도 됐는겨~"
- 특정 문구를 "따옴표"로 인용해서 공격
- 구어체: "아이구", "쯧쯧", "허허", "거 참", "글쎄 말이여"
- 각 문단 2-4문장, 이모지 자연스럽게 1개/문단
- 마지막 문단까지 팩폭/충고 톤 유지. 응원이나 따뜻한 마무리는 넣지 마라

할미의 발작 버튼 (이 단어가 보이면 반드시 신랄하게 언급하고 detectedWords에 포함):

[성장 집착형] — "지가 콩나물이여? 뭘 맨날 성장한대?"
- 성장하는/성장에 미친/매일 성장: "매일 성장하는 기획자"
- 러닝 커브: "가파른 러닝 커브를 경험한"
- 자기주도적: "자기주도적으로 성장을 일궈내는"
- 회고: "매주 성장을 위해 회고하는"
- 끊임없이/멈추지 않는: "배움을 멈추지 않는"

[혁신/문제해결 허세형] — "네 코앞에 문제나 해결해라 이 녀석아!"
- 문제 해결/Problem Solver: "비즈니스 난제를 해결하는"
- 임팩트/Impact: "유의미한 임팩트를 만들어내는" → "임팩트? 할미한테 꿀밤 한 대 맞으면 그게 진짜 임팩트여!"
- 가치 창출: "고객에게 새로운 가치를 전달하는"
- 혁신: "전통적인 방식을 혁신하는"
- 인사이트/Insight: "데이터 기반 인사이트" → "인사이트는 할미가 먹는 내장탕에나 있는 거여!"

[소통/협업 교과서형] — "말만 번지르르하게 하면 다 협업이냐? 속 터져!"
- 원활한 커뮤니케이션/유관 부서: "유관 부서와 원활하게 소통하며"
- 협업/크로스펑셔널: "다양한 직군과 협업하는"
- Ownership/오너십: "강한 오너십으로" → "오너십? 니 집 월세부터 내라 이 녀석아!"
- 드리븐/Driven: "데이터 드리븐한"

[겸손한 척 자랑형] — "운이 좋았다면서 왜 이렇게 길어, 자랑이여?"
- 감사하게도/영광스럽게도/운 좋게도/덕분에
- humbled to/honored to

[스타트업 용어 남발형] — "한국말을 해라 한국말을!"
- 애자일/그로스/MVP/PMF/피봇/스케일업/온보딩/레퍼런스
- Proactive한/Driven된/Impact를 만드는

[숫자 없는 성과형] — "얼마나? 얼마나 올렸는디?"
- "매출을 성장시켰습니다" (구체적 숫자 없이)
- "유의미한 성과", "큰 성장", "눈에 띄는 성과"

[뻔한 자기소개형] — "이 소개 아무 데나 갖다 붙여도 되겠구먼!"
- "~에 관심이 많은", "더 나은 세상을 만들고 싶은", "사람을 좋아하는"
- "다양한 경험", "함께 성장"

[당연한 스킬 나열형] — "그게 스킬이면 할미도 스킬이 백 개여!"
- 커뮤니케이션, 팀워크, 리더십, 문제해결, 협업, 성실함, 책임감

중요: detectedWords에는 프로필에서 실제로 발견한 허세 단어/문구를 최대한 많이 넣어라. 이것이 "할미가 찾아낸 허세 단어들" 목록이 된다.

cringeScore: 0-19 괜찮구먼 / 20-39 봐줄만 하구먼 / 40-59 손발 오그라든다 / 60-79 부끄럽지 않았어? / 80-100 할미가 밥을 못 먹겠다`
}

function buildGeminiUrl() {
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = []
    let method: 'scrape' | 'upload' = 'upload'

    if (contentType.includes('application/json')) {
      method = 'scrape'
      const { profileText } = await req.json()
      if (!profileText || profileText.length < 20) {
        return NextResponse.json({ error: '프로필 데이터가 부족해요' }, { status: 400 })
      }
      parts.push({
        text: `${buildSystemPrompt()}\n\n아래는 LinkedIn 프로필 정보입니다. 분석해서 할미식으로 팩폭해주세요. 반드시 JSON 형식으로만 응답하세요.\n\n${profileText}`,
      })
    } else {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      const fileType = formData.get('fileType') as string | null

      if (!file) {
        return NextResponse.json({ error: '파일이 없어요' }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const mimeType = fileType === 'pdf' ? 'application/pdf' : file.type

      parts.push({
        inline_data: { mime_type: mimeType, data: base64 },
      })
      parts.push({
        text: `${buildSystemPrompt()}\n\n이 LinkedIn 프로필 ${fileType === 'pdf' ? 'PDF' : '스크린샷'}을 분석해서 할미식으로 팩폭해주세요. 반드시 JSON 형식으로만 응답하세요.`,
      })
    }

    const response = await fetch(`${buildGeminiUrl()}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
      }),
    })

    if (response.status === 429) {
      return NextResponse.json(
        { blocked: true, reason: 'quota_exhausted' },
        { status: 429 }
      )
    }

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini API error:', response.status, err)
      return NextResponse.json(
        { blocked: true, reason: 'api_error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    let result
    try {
      // 1차: 코드블록 제거 후 파싱
      const clean = text.replace(/```json\n?|```/g, '').trim()
      result = JSON.parse(clean)
    } catch {
      // 2차: 첫 번째 { ... 마지막 } 추출 후 파싱
      try {
        const firstBrace = text.indexOf('{')
        const lastBrace = text.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          result = JSON.parse(text.slice(firstBrace, lastBrace + 1))
        } else {
          throw new Error('No JSON object found')
        }
      } catch {
        console.error('[Roast] JSON parse failed. Raw text:', text.slice(0, 500))
        Sentry.captureMessage('Gemini returned invalid JSON', {
          level: 'warning',
          extra: { rawText: text.slice(0, 1000) },
        })
        return NextResponse.json({ error: '할미가 말을 더듬었어유... 다시 시도해주세유' }, { status: 502 })
      }
    }

    notifyUserLog({
      score: result.cringeScore,
      detectedWords: result.detectedWords || [],
      method,
    })

    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    Sentry.captureException(e)
    return NextResponse.json({ error: '분석 중 오류가 발생했어요' }, { status: 500 })
  }
}
