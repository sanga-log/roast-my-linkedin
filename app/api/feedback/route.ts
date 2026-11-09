import { NextRequest, NextResponse } from 'next/server'
import { notifyFeedback } from '../../lib/slack'
import { recordEvent } from '../../lib/events'
import { alertServerError } from '../../lib/errorAlert'

const MAX_FEEDBACK_LENGTH = 500

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: '내용을 입력해주세유' }, { status: 400 })
    }

    const trimmed = message.trim().slice(0, MAX_FEEDBACK_LENGTH)
    await Promise.all([
      notifyFeedback(trimmed),
      recordEvent({ type: 'feedback_sent', message: trimmed }),
    ])

    return NextResponse.json({ success: true })
  } catch (e) {
    await alertServerError({
      source: '/api/feedback',
      title: '피드백 처리 실패',
      detail: e instanceof Error ? e.message : String(e),
    })
    return NextResponse.json({ error: '전송 실패' }, { status: 500 })
  }
}
