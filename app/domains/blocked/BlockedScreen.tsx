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
      padding: '48px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20 }}>
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
            할미 방법으로 계속하기
          </button>
        )}
      </div>
    </div>
  )
}

function ErrorTerminal({ isQuota }: { isQuota: boolean }) {
  const accentColor = isQuota ? '#DAA520' : '#C0392B'
  const label = isQuota ? 'API_QUOTA_EXHAUSTED' : 'SCRAPING_BLOCKED'
  const lines = isQuota
    ? [
      { text: '> 요청 한도 초과', highlight: false },
      { text: '> 429 Too Many Requests', highlight: true },
      { text: '> Rate limit reached', highlight: false },
    ]
    : [
      { text: '> GET linkedin.com/in/profile', highlight: false },
      { text: '> 403 Forbidden', highlight: true },
      { text: '> Bot detection triggered', highlight: false },
    ]

  const reasonText = isQuota
    ? '할미떼가 너무 인기가 많아부러서 요청 한도를 넘겨부렀어유~'
    : 'LinkedIn이 할미 못 들어오게 막아부렀어유~'

  return (
    <div style={{
      background: isQuota ? 'rgba(218,165,32,0.06)' : 'rgba(192,57,43,0.06)',
      border: `1px solid ${isQuota ? 'rgba(218,165,32,0.2)' : 'rgba(192,57,43,0.2)'}`,
      borderRadius: 'var(--radius)', padding: '16px 20px',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        fontSize: '0.8125rem', color: accentColor, fontWeight: 700,
        marginBottom: 12, letterSpacing: '0.03em',
      }}>
        {label}
      </div>

      <div style={{
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        fontSize: '0.8125rem', lineHeight: 2,
        marginBottom: 12,
      }}>
        {lines.map((l, i) => (
          <div key={i} style={{
            color: l.highlight ? accentColor : 'rgba(255,255,255,0.35)',
          }}>
            {l.text}
          </div>
        ))}
      </div>

      <div style={{
        paddingTop: 12, borderTop: `1px solid ${isQuota ? 'rgba(218,165,32,0.12)' : 'rgba(192,57,43,0.12)'}`,
        fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
      }}>
        {reasonText}
      </div>
    </div>
  )
}

function RevealSection({ isQuota }: { isQuota: boolean }) {
  const description = (<><strong style={{ color: 'rgba(255,255,255,0.87)' }}>직접 올리는 방법</strong>으로 할미한테 보여주면 되는겨~</>)

  const alternatives = [
    { icon: '💻', title: 'PC라면 PDF 저장', desc: '프로필 → 더보기 → "PDF로 저장" → 여기서 업로드' },
    { icon: '📱', title: '모바일이라면 스크린샷', desc: '직함 + 정보 섹션 캡처 → 여기서 업로드' },
  ]

  return (
    <div style={{ animation: 'slideUp 0.5s ease', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        width: 100, margin: '0 auto 4px',
        animation: 'wobble 1s ease-in-out infinite',
        filter: 'drop-shadow(0 0 8px rgba(218,165,32,0.35))',
      }}>
        <img src="/halmi.png" alt="할미" style={{ width: '100%', objectFit: 'contain' }} />
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(139,69,19,0.12), rgba(218,165,32,0.06))',
        border: '1px solid rgba(218,165,32,0.2)',
        borderRadius: 'var(--radius)', padding: '24px 20px', textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: '1.375rem', fontWeight: 900, letterSpacing: '0.04em',
          marginBottom: 12, lineHeight: 1.4,
          background: 'linear-gradient(135deg, #DAA520, #D2691E)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          이럴 줄 알고 할미가 다~ 준비해뒀당께
        </div>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
          {description}
        </p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px',
      }}>
        <div style={{
          fontSize: '0.6875rem', fontWeight: 700, color: 'rgba(255,255,255,0.38)',
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12,
        }}>
          할미가 알려주는 대안
        </div>
        {alternatives.map(({ icon, title, desc }) => (
          <div key={title} style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            marginBottom: 10, padding: '8px 0',
          }}>
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{icon}</span>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255,255,255,0.87)' }}>{title}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
