import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

function getRedis() {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

const KEYS = {
  totalRoasts: 'halmi:total_roasts',
  totalScore: 'halmi:total_score',
}

const FALLBACK_STATS = { totalRoasts: 0, avgScore: 0 }

// GET — 현재 통계 조회
export async function GET() {
  const redis = getRedis()
  if (!redis) {
    return NextResponse.json(FALLBACK_STATS)
  }

  try {
    const [totalRoasts, totalScore] = await Promise.all([
      redis.get<number>(KEYS.totalRoasts),
      redis.get<number>(KEYS.totalScore),
    ])

    const roasts = totalRoasts ?? 0
    const avgScore = roasts > 0 ? Math.round((totalScore ?? 0) / roasts) : 0

    return NextResponse.json({ totalRoasts: roasts, avgScore })
  } catch (e) {
    console.error('[Stats] GET error:', e)
    return NextResponse.json(FALLBACK_STATS)
  }
}

// POST — 팩폭 완료 시 통계 업데이트
export async function POST(req: NextRequest) {
  const redis = getRedis()
  if (!redis) {
    return NextResponse.json({ ok: false })
  }

  try {
    const { score } = await req.json()
    const cringeScore = Number(score)

    if (isNaN(cringeScore) || cringeScore < 0 || cringeScore > 100) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    await Promise.all([
      redis.incr(KEYS.totalRoasts),
      redis.incrby(KEYS.totalScore, cringeScore),
    ])

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[Stats] POST error:', e)
    return NextResponse.json({ ok: false })
  }
}
