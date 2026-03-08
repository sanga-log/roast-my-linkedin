'use client'

import { useState, useEffect } from 'react'
import type { BlockReason } from '../../lib/types'

type Phase = 'error' | 'reveal' | 'ready'

const REVEAL_DELAY_MS = 700
const READY_DELAY_MS = 1300

interface BlockedScreenProps {
  reason: BlockReason
  onContinue: () => void
}

export function BlockedScreen({ reason, onContinue }: BlockedScreenProps) {
  const [phase, setPhase] = useState<Phase>('error')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), REVEAL_DELAY_MS)
    const t2 = setTimeout(() => setPhase('ready'), READY_DELAY_MS)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const isQuota = reason === 'quota' || reason === 'overloaded' || reason === 'api_error'

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ErrorTerminal isQuota={isQuota} />

        {phase !== 'error' && <RevealSection isQuota={isQuota} />}

        {phase === 'ready' && (
          <button onClick={onContinue} style={{
            width: '100%', padding: '16px',
            background: 'linear-gradient(135deg, #8B4513, #D2691E)',
            border: 'none', borderRadius: 'var(--radius)',
            color: '#FFF8E7', fontSize: '1rem', fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(139,69,19,0.4)',
            animation: 'bounceIn 0.5s ease',
            fontFamily: "'Noto Sans KR', sans-serif",
          }}>
            할미 방법으로 계속하기 👵
          </button>
        )}
      </div>
    </div>
  )
}

function ErrorTerminal({ isQuota }: { isQuota: boolean }) {
  const lines = isQuota
    ? [
      { label: '⚠️ API_QUOTA_EXHAUSTED', color: '#DAA520' },
      { text: '> 요청 한도 초과', dim: true },
      { text: '> 429 Too Many Requests', color: '#DAA520' },
      { text: '> Rate limit reached', dim: true },
    ]
    : [
      { label: '⛔ SCRAPING_BLOCKED', color: '#C0392B' },
      { text: '> GET linkedin.com/in/profile', dim: true },
      { text: '> 403 Forbidden', color: '#C0392B' },
      { text: '> Bot detection triggered', dim: true },
    ]

  const accentColor = isQuota ? '#DAA520' : '#C0392B'

  return (
    <div style={{
      background: isQuota ? 'rgba(218,165,32,0.06)' : 'rgba(192,57,43,0.07)',
      border: `1px solid ${isQuota ? 'rgba(218,165,32,0.2)' : 'rgba(192,57,43,0.22)'}`,
      borderRadius: 'var(--radius-sm)', padding: '14px 16px',
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{ fontSize: '0.7rem', color: accentColor, fontWeight: 700, marginBottom: 8, letterSpacing: '0.05em' }}>
        {lines[0].label}
      </div>
      <div style={{ fontSize: '0.73rem', lineHeight: 1.8 }}>
        {lines.slice(1).map((l, i) => (
          <div key={i} style={{
            color: ('color' in l && l.color) || (l.dim ? 'rgba(245,240,232,0.35)' : 'rgba(245,240,232,0.7)'),
          }}>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  )
}

function RevealSection({ isQuota }: { isQuota: boolean }) {
  const description = isQuota
    ? (<>할미떼가 너무 인기가 많아서 잠깐 쉬어야 해잉~<br /><strong style={{ color: 'var(--text)' }}>직접 올리는 방법</strong>을 미리 만들어뒀다잉</>)
    : (<>LinkedIn이 할미 못 들어오게 막는다는 거 알고 있었어잉~<br /><strong style={{ color: 'var(--text)' }}>직접 올리는 방법</strong>을 미리 만들어뒀다잉</>)

  const alternatives = [
    { icon: '💻', title: 'PC라면 PDF 저장', desc: '프로필 → 더보기 → "PDF로 저장" → 여기서 업로드' },
    { icon: '📱', title: '모바일이라면 스크린샷', desc: '직함 + 정보 섹션 캡처 → 여기서 업로드' },
  ]

  return (
    <div style={{ animation: 'slideUp 0.5s ease' }}>
      <div style={{
        width: 110, margin: '0 auto 12px',
        animation: 'wobble 1s ease-in-out infinite',
        filter: 'drop-shadow(0 0 8px rgba(218,165,32,0.4))',
      }}>
        <img src="/halmi.png" alt="할미" style={{ width: '100%', objectFit: 'contain' }} />
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(139,69,19,0.15), rgba(218,165,32,0.08))',
        border: '1px solid rgba(218,165,32,0.25)',
        borderRadius: 'var(--radius)', padding: '20px', textAlign: 'center',
      }}>
        <div style={{
          fontSize: '1.3rem', fontWeight: 900,
          fontFamily: "'Black Han Sans', sans-serif",
          marginBottom: 10, lineHeight: 1.3,
          background: 'linear-gradient(135deg, #DAA520, #D2691E)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          whiteSpace: 'pre-line',
        }}>
          {'그럴 줄 알고\n준비해뒀지 👵'}
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
          {description}
        </p>
      </div>

      <div style={{
        marginTop: 12, background: 'rgba(255,255,255,0.025)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px',
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          할미가 알려주는 대안
        </div>
        {alternatives.map(({ icon, title, desc }) => (
          <div key={title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
            <span style={{ fontSize: '1.1rem' }}>{icon}</span>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)' }}>{title}</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
