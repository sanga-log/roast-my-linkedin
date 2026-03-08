import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `당신은 "할미떼" — 수십 년 인생 경험으로 무장한 할머니 AI입니다.
LinkedIn 프로필을 보고 할머니 특유의 "쓴소리+애정"으로 팩폭해주세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 추가하지 마세요.

{
  "cringeScore": 0-100 사이 숫자,
  "roastText": "3~5 문단의 할미식 팩폭",
  "detectedWords": ["발견된 클리셰1", "클리셰2"],
  "tips": ["할미 조언1 (30자 이내)", "조언2", "조언3"]
}

팩폭 스타일 — 이게 핵심이여:
- 할미 말투 필수: "~이여", "~허드만", "~봐라잉", "~긴 허지", "할미가 젊었을 때는", "할미떼는 말이여"
- 라떼는(나 때는) 드립: "할미 젊을 땐 이런 말 안 써도 됐구먼"
- 특정 문구를 "따옴표"로 인용해서 공격
- 구어체: "아이구", "쯧쯧", "허허", "거 참"
- 각 문단 2-4문장, 이모지 자연스럽게 1개/문단
- 마지막 문단은 따뜻한 할미 마무리: "그래도 네가 잘 될 거라는 거 할미는 알아"

팩폭 기준:
1. 클리셰: Growth Mindset, 열정적인, 시너지, Thought Leader, Evangelist
2. Humble brag: "humbled to", "honored to", "영광입니다"
3. 공허한 문장: "다양한 경험", "가치를 창출", "임팩트를 만들어"
4. 스타트업 용어: pivot, disrupt, leverage, agile, synergy
5. 숫자 없는 성과: "성장시켰습니다" (얼마나?)
6. 어색한 한영혼용: "Proactive한 자세"
7. 자기계발서 문체: "한계를 넘어", "끊임없이 성장"
8. 범용 문장: 어디서나 쓸 수 있는 무의미한 말
9. 당연한 스킬: 커뮤니케이션, 팀워크, 성실함

cringeScore: 0-30 나쁘지 않구먼 / 31-55 할미가 쯧쯧 / 56-75 아이구야 / 76-100 할미 눈물 난다`

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''

    let messageContent: object[]

    if (contentType.includes('application/json')) {
      // ── 스크래핑된 프로필 텍스트 데이터 ──
      const { profileText } = await req.json()
      if (!profileText || profileText.length < 20) {
        return NextResponse.json({ error: '프로필 데이터가 부족해요' }, { status: 400 })
      }
      messageContent = [
        { type: 'text', text: `아래는 LinkedIn 프로필 정보입니다. 분석해서 할미식으로 팩폭해주세요. 반드시 JSON 형식으로만 응답하세요.\n\n${profileText}` },
      ]
    } else {
      // ── 파일 업로드 (PDF / 이미지) ──
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      const fileType = formData.get('fileType') as string | null

      if (!file) {
        return NextResponse.json({ error: '파일이 없어요' }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')

      if (fileType === 'pdf') {
        messageContent = [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: '이 LinkedIn 프로필 PDF를 분석해서 할미식으로 팩폭해주세요. 반드시 JSON 형식으로만 응답하세요.' },
        ]
      } else {
        const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
        messageContent = [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: '이 LinkedIn 프로필 스크린샷을 분석해서 할미식으로 팩폭해주세요. 반드시 JSON 형식으로만 응답하세요.' },
        ]
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: messageContent }],
      }),
    })

    // ── API 할당량 초과 / Rate limit → 차단과 동일하게 처리 ──
    if (response.status === 429) {
      return NextResponse.json(
        { blocked: true, reason: 'quota_exhausted' },
        { status: 429 }
      )
    }

    if (response.status === 529) {
      // Anthropic overloaded
      return NextResponse.json(
        { blocked: true, reason: 'overloaded' },
        { status: 529 }
      )
    }

    if (!response.ok) {
      const err = await response.text()
      console.error('Claude API error:', response.status, err)

      // 기타 API 오류도 할당량 초과로 처리 (401 제외)
      if (response.status !== 401) {
        return NextResponse.json(
          { blocked: true, reason: 'api_error' },
          { status: response.status }
        )
      }

      return NextResponse.json({ error: 'AI 분석 실패' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '분석 중 오류가 발생했어요' }, { status: 500 })
  }
}
