import type { NextRequest } from 'next/server'
import { MAX_ROASTS_PER_HOUR } from './limits'
import { getRedis } from './redis'

const WINDOW_SECONDS = 60 * 60

function getClientIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
}

// URL로 한 번 분석하면 scrape와 roast를 한 번씩 부르므로 API별로 따로 센다.
// Redis가 없거나 장애가 나면 서비스를 막지 않고 통과시킨다.
export async function isRateLimited(req: NextRequest, scope: 'scrape' | 'roast') {
  const redis = getRedis()
  if (!redis) return false

  const key = `halmi:rate:${scope}:${getClientIp(req)}`

  try {
    // 키가 없을 때만 만료를 잡으므로 첫 요청부터 1시간이 지나면 풀린다
    const [, count] = await redis
      .multi()
      .set(key, 0, { nx: true, ex: WINDOW_SECONDS })
      .incr(key)
      .exec<[unknown, number]>()

    return count > MAX_ROASTS_PER_HOUR
  } catch (e) {
    console.error('[RateLimit] error:', e)
    return false
  }
}
