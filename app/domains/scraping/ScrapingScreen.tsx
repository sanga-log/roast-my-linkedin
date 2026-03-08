'use client'

import { useState, useEffect } from 'react'
import { HalmiSpinner } from '../../components/HalmiSpinner'

function extractHandle(url: string) {
  return url.split('/in/')[1]?.split('?')[0]?.split('/')[0] || 'profile'
}

export function ScrapingScreen({ url }: { url: string }) {
  const [step, setStep] = useState(0)
  const handle = extractHandle(url)

  const steps = [
    `할미가 ${handle} 프로필 보러 가는 중...`,
    '할미가 안경 쓰고 접속 중...',
    '할미가 데이터 긁어오는 중...',
  ]

  useEffect(() => {
    const STEP_INTERVAL_MS = 750
    const id = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), STEP_INTERVAL_MS)
    return () => clearInterval(id)
  }, [steps.length])

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 32, padding: '40px 24px', animation: 'fadeIn 0.3s ease',
    }}>
      <HalmiSpinner size={80} halmiSize={40} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600, marginBottom: 10 }}>
          {steps[step]}
        </div>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i <= step ? 16 : 5, height: 5, borderRadius: 3,
              background: i <= step ? 'var(--halmi-gold)' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
