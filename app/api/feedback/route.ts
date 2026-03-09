import { NextRequest, NextResponse } from 'next/server'
import { notifyFeedback } from '../../lib/slack'

const MAX_FEEDBACK_LENGTH = 500

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: '내용을 입력해주세유' }, { status: 400 })
    }

    const trimmed = message.trim().slice(0, MAX_FEEDBACK_LENGTH)
    await notifyFeedback(trimmed)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '전송 실패' }, { status: 500 })
  }
}
