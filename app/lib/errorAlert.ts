import { getRedis, IS_PRODUCTION } from './redis'
import { notifyError } from './slack'

const ALERT_COOLDOWN_SECONDS = 60 * 60

interface ServerErrorAlert {
  source: string
  title: string
  detail?: string
}

// 할당량이 바닥나면 모든 요청이 같은 에러를 내므로 같은 에러는 1시간에 한 번만 보낸다.
// Redis가 없거나 장애가 나면 중복을 감수하고 보낸다.
async function claimAlertSlot(key: string) {
  const redis = getRedis()
  if (!redis) return true

  try {
    const claimed = await redis.set(`halmi:alert:${key}`, 1, { nx: true, ex: ALERT_COOLDOWN_SECONDS })
    return claimed === 'OK'
  } catch {
    return true
  }
}

// Sentry 무료 플랜은 슬랙 연동을 지원하지 않아서 서버 에러는 슬랙 웹훅으로 직접 알린다
export async function alertServerError({ source, title, detail }: ServerErrorAlert) {
  if (!IS_PRODUCTION) return
  if (!(await claimAlertSlot(`${source}:${title}`))) return

  const text = [
    `🚨 *서버 에러* — ${source}`,
    `• ${title}`,
    detail ? `• 상세: ${detail.slice(0, 500)}` : null,
    `_같은 에러는 1시간에 한 번만 알립니다_`,
  ]
    .filter(Boolean)
    .join('\n')

  await notifyError(text)
}
