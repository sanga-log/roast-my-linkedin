'use client'

import { useState, useEffect } from 'react'
import { HalmiSpinner } from '../../components/HalmiSpinner'

const LOADING_STEPS = [
  '👓 할미가 안경 쓰고 보는 중...',
  '🔍 프로필 구석구석 뒤지는 중...',
  '📝 할미식 처방전 작성 중...',
  '🔥 팩폭 강도 조절 중...',
  '👊 할미 주먹 날릴 준비 완료...',
]

const STEP_INTERVAL_MS = 2400

export function LoadingScreen() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), STEP_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 28, padding: '40px 24px', animation: 'fadeIn 0.4s ease',
    }}>
      <HalmiSpinner size={90} halmiSize={56} />

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
          {LOADING_STEPS[step]}
        </div>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
          {LOADING_STEPS.map((_, i) => (
            <div key={i} style={{
              width: i <= step ? 18 : 5, height: 5, borderRadius: 3,
              background: i <= step ? 'var(--halmi-gold)' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
        할미떼는 말이여~<br />프로필 분석에 정성을 다하고 있는겨~
      </div>
    </div>
  )
}
