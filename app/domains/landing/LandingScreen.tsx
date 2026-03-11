'use client'

import { AnimatedCount } from '../../components/AnimatedCount'

interface Stats {
  totalRoasts: number
  avgScore: number
}

interface LandingScreenProps {
  url: string
  stats: Stats
  onUrlChange: (url: string) => void
  onScrape: () => void
}

export function LandingScreen({ url, stats, onUrlChange, onScrape }: LandingScreenProps) {
  const isValidUrl = url.includes('linkedin.com')

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* 배경 글로우 */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 480, height: 480,
        background: 'radial-gradient(circle, rgba(139,69,19,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 420,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 32, animation: 'slideUp 0.6s ease',
      }}>
        <HeroSection />
        <ClicheShowcase />
        <StatsBar totalRoasts={stats.totalRoasts} avgScore={stats.avgScore} />
        <UrlInput url={url} isValid={isValidUrl} onChange={onUrlChange} onSubmit={onScrape} />
        <MitteCta />
      </div>
    </div>
  )
}

function HeroSection() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 200, height: 200, margin: '0 auto 12px',
        animation: 'wobble 2.5s ease-in-out infinite',
        filter: 'drop-shadow(0 0 20px rgba(218,165,32,0.35))',
      }}>
        <img src="/halmi.png" alt="할미떼" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      <h1 style={{
        fontFamily: "'Noto Sans KR', sans-serif",
        fontSize: '2.5rem', fontWeight: 900, letterSpacing: '0.06em', lineHeight: 1.2,
        background: 'linear-gradient(135deg, #DAA520, #D2691E)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: 8,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
      }}>
        할미떼
      </h1>

      <p style={{
        fontSize: '1rem', fontWeight: 600, lineHeight: 1.15,
        background: 'linear-gradient(135deg, #DAA520, #D2691E)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        letterSpacing: '0.01em',
      }}>
        할미의 매운맛 LinkedIn 충고
      </p>
    </div>
  )
}

function ClicheShowcase() {
  const cliches = [
    { word: '성장하는', score: 82 },
    { word: '임팩트', score: 91 },
    { word: '자기주도적', score: 76 },
    { word: '감사하게도', score: 88 },
    { word: '커뮤니케이션', score: 74 },
  ]

  return (
    <div style={{
      width: '100%', padding: '20px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
    }}>
      <p style={{
        fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)',
        lineHeight: 1.6, textAlign: 'center', marginBottom: 16,
      }}>
        할미떼는 말이여~ 이런 말 쓰면{' '}
        <strong style={{ color: 'rgba(255,255,255,0.87)' }}>밥줄이 끊기는 거여~</strong>
      </p>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {cliches.map(({ word, score }) => (
          <div key={word} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            background: 'rgba(210,105,30,0.1)',
            border: '1px solid rgba(210,105,30,0.2)',
            borderRadius: 20,
          }}>
            <span style={{
              fontSize: '0.8125rem', color: '#D2691E', fontWeight: 600,
            }}>"{word}"</span>
            <span style={{
              fontSize: '0.6875rem', fontWeight: 800,
              color: score >= 80 ? '#C0392B' : '#DAA520',
            }}>{score}점</span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 12, padding: '8px 16px',
        background: 'rgba(192,57,43,0.06)',
        border: '1px solid rgba(192,57,43,0.12)',
        borderRadius: 8, textAlign: 'center',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
          점수가 높을수록 오글거리는 프로필 — <strong style={{ color: '#C0392B' }}>100점이면 할미가 밥을 못 먹는겨 😭</strong>
        </span>
      </div>
    </div>
  )
}

function StatsBar({ totalRoasts, avgScore }: Stats) {
  const items = [
    { value: totalRoasts, label: '할미한테 혼남' },
    { value: avgScore, label: '평균 오글 점수' },
  ]

  return (
    <div style={{
      display: 'flex', gap: 32, padding: '12px 32px',
      background: 'rgba(218,165,32,0.05)',
      border: '1px solid var(--border)',
      borderRadius: 100,
    }}>
      {items.map(({ value, label }) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.125rem', fontWeight: 800,
            color: 'var(--halmi-gold)', lineHeight: 1.2,
          }}>
            <AnimatedCount target={value} />
          </div>
          <div style={{
            fontSize: '0.6875rem', color: 'rgba(255,255,255,0.38)',
            marginTop: 2,
          }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

function UrlInput({ url, isValid, onChange, onSubmit }: {
  url: string; isValid: boolean; onChange: (v: string) => void; onSubmit: () => void
}) {
  const koreanPattern = /linkedin\.com\/in\/.*[가-힣]/
  const encodedKoreanPattern = /linkedin\.com\/in\/.*%[A-Fa-f0-9]{2}/
  let decoded = url
  try { decoded = decodeURIComponent(url) } catch {}
  const hasKoreanUsername = koreanPattern.test(url) || encodedKoreanPattern.test(decoded)

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        fontSize: '0.6875rem', fontWeight: 700,
        color: 'rgba(255,255,255,0.38)',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        LinkedIn URL로 바로 분석
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="url"
          placeholder="linkedin.com/in/your-profile"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && isValid && onSubmit()}
          style={{
            flex: 1, padding: '14px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${isValid ? 'rgba(218,165,32,0.4)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 12, color: 'rgba(255,255,255,0.87)',
            fontSize: '0.875rem', outline: 'none',
            fontFamily: "'Noto Sans KR', sans-serif",
            transition: 'border-color 0.2s',
          }}
        />
        <button
          onClick={onSubmit}
          disabled={!isValid}
          style={{
            padding: '14px 20px',
            background: isValid
              ? 'linear-gradient(135deg, #8B4513, #D2691E)'
              : 'rgba(255,255,255,0.04)',
            border: 'none', borderRadius: 12,
            color: isValid ? '#FFF8E7' : 'rgba(255,255,255,0.38)',
            fontSize: '0.9375rem', fontWeight: 700,
            cursor: isValid ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
            fontFamily: "'Noto Sans KR', sans-serif",
            boxShadow: isValid ? '0 4px 16px rgba(139,69,19,0.3)' : 'none',
          }}
        >
          혼내줘 →
        </button>
      </div>
      {hasKoreanUsername && (
        <p style={{
          fontSize: '0.75rem', color: 'rgba(218,165,32,0.7)',
          marginTop: 8, lineHeight: 1.5,
        }}>
          URL에 한글이 포함되어 있으면 스크래핑이 안 될 수 있어유. 그땐 PDF/스크린샷으로 올려주면 할미가 봐줄게유~
        </p>
      )}
    </div>
  )
}

function MitteCta() {
  return (
    <div style={{
      fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)',
      textAlign: 'center', lineHeight: 1.7,
    }}>
      동서식품 담당자님 보고 계시유?<br />
      <span style={{ color: 'rgba(218,165,32,0.5)' }}>할미떼 × 미떼 콜라보 어떻겠어유~ 💛</span>
    </div>
  )
}
