import { Redis } from '@upstash/redis'

export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

// 로컬·프리뷰에서 나는 기록과 알림이 운영 데이터에 섞이지 않게 나눈다
export const IS_PRODUCTION = process.env.VERCEL_ENV === 'production'
