import { getRedis, IS_PRODUCTION } from './redis'

export type RoastInput = 'url' | 'pdf' | 'screenshot'

export type ScrapeBlockReason = 'invalid_url' | 'rate_limited' | 'no_api_key' | 'all_apis_exhausted'

export type RoastFailReason = 'rate_limited' | 'quota_exhausted' | 'api_error' | 'invalid_json' | 'server_error'

type HalmiEvent =
  | { type: 'scrape_blocked'; reason: ScrapeBlockReason; hasKoreanUsername: boolean }
  | { type: 'scrape_succeeded'; scraper: string }
  | { type: 'roast_succeeded'; input: RoastInput; score: number; detectedWords: string[] }
  | { type: 'roast_failed'; input: RoastInput; reason: RoastFailReason }
  | { type: 'feedback_sent'; message: string }

const EVENTS_KEY = IS_PRODUCTION ? 'halmi:events' : 'halmi:dev:events'

// 슬랙은 알림용, Redis는 기록용이다. 슬랙 무료 플랜은 90일 지난 메시지를 숨기고 1년 지나면 지운다.
// 차단 화면에서 그냥 나간 사람도 셀 수 있도록 성공뿐 아니라 차단·실패도 남긴다.
// LinkedIn 주소와 IP는 남기지 않는다. 기록에 실패해도 사용자 요청은 그대로 진행한다.
export async function recordEvent(event: HalmiEvent) {
  const redis = getRedis()
  if (!redis) return

  try {
    await redis.lpush(EVENTS_KEY, JSON.stringify({ ...event, at: new Date().toISOString() }))
  } catch (e) {
    console.error('[Events] 기록 실패:', e)
  }
}
