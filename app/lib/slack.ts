export async function notifyFeedback(message: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_USER_LOG
  if (!webhookUrl) return

  const text = [
    `💌 *사용자 피드백 도착!*`,
    `> ${message}`,
  ].join('\n')

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  } catch {
    console.error('[Slack] feedback 전송 실패')
  }
}

export async function notifyUserLog(data: {
  score: number
  detectedWords: string[]
  method: 'scrape' | 'upload'
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_USER_LOG
  if (!webhookUrl) return

  const scoreLabel =
    data.score < 20 ? '괜찮구먼 👵' :
    data.score < 40 ? '봐줄만 하구먼 😏' :
    data.score < 60 ? '손발 오그라드는겨 🫣' :
    data.score < 80 ? '부끄럽지 않았어유? 💀' :
    '밥을 못 먹겠어유 😭'

  const methodLabel = data.method === 'scrape' ? 'URL 스크래핑' : '파일 업로드'

  const text = [
    `👵 *팩폭 완료!*`,
    `• 오글 점수: *${data.score}/100* (${scoreLabel})`,
    data.detectedWords.length > 0
      ? `• 허세 단어: ${data.detectedWords.join(', ')}`
      : '• 허세 단어: 없음',
    `• 분석 방식: ${methodLabel}`,
  ].join('\n')

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  } catch {
    console.error('[Slack] user log 전송 실패')
  }
}
