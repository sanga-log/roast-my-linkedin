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
      padding: '40px 20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(139,69,19,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, animation: 'slideUp 0.6s ease' }}>
        <HeroSection />
        <StatsBar totalRoasts={stats.totalRoasts} avgScore={stats.avgScore} />
        <UrlInput url={url} isValid={isValidUrl} onChange={onUrlChange} onSubmit={onScrape} />
        <ReviewList />
        <MitteCta />
      </div>
    </div>
  )
}

function HeroSection() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 180, height: 180, margin: '0 auto 8px',
        animation: 'wobble 2.5s ease-in-out infinite',
        filter: 'drop-shadow(0 0 24px rgba(218,165,32,0.4))',
        position: 'relative',
      }}>
        <img src="/halmi.png" alt="할미떼" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <h1 style={{
        fontFamily: "'Black Han Sans', sans-serif",
        fontSize: '2.8rem', letterSpacing: '-0.01em', lineHeight: 1.1,
        color: '#E53935', marginBottom: 6,
        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
      }}>
        할미떼
      </h1>
      <div style={{
        fontSize: '0.88rem', fontWeight: 600,
        background: 'linear-gradient(135deg, #DAA520, #D2691E)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: 14, letterSpacing: '0.02em',
      }}>
        할미의 매운맛 LinkedIn 충고
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: 1.8, maxWidth: 310 }}>
        "열정적인", "Growth Mindset", "시너지"...<br />
        할미떼는 말이여~ 그런 말 쓰면<br />
        <strong style={{ color: 'var(--text)' }}>이력서에 풀칠만 하고 사는 거여~ 👊</strong>
      </p>
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
      display: 'flex', gap: 24, padding: '12px 28px',
      background: 'rgba(218,165,32,0.06)', border: '1px solid var(--border)',
      borderRadius: 100,
    }}>
      {items.map(({ value, label }) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--halmi-gold)' }}>
            <AnimatedCount target={value} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

function UrlInput({ url, isValid, onChange, onSubmit }: {
  url: string; isValid: boolean; onChange: (v: string) => void; onSubmit: () => void
}) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
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
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${isValid ? 'rgba(218,165,32,0.4)' : 'var(--border)'}`,
            borderRadius: 12, color: 'var(--text)',
            fontSize: '0.88rem', outline: 'none',
            fontFamily: "'Noto Sans KR', sans-serif",
            transition: 'border-color 0.2s',
          }}
        />
        <button
          onClick={onSubmit}
          disabled={!isValid}
          style={{
            padding: '14px 18px',
            background: isValid ? 'linear-gradient(135deg, #8B4513, #D2691E)' : 'rgba(255,255,255,0.06)',
            border: 'none', borderRadius: 12,
            color: isValid ? '#FFF8E7' : 'var(--text-muted)',
            fontSize: '0.9rem', fontWeight: 700,
            cursor: isValid ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
            fontFamily: "'Noto Sans KR', sans-serif",
          }}
        >
          혼내줘 →
        </button>
      </div>
    </div>
  )
}


function ReviewList() {
  const reviews = [
    { score: 81, name: '이직 준비 중 주니어', text: '"열정적인" 썼다고 할미한테 혼났어요 😭' },
    { score: 67, name: '스타트업 PM', text: '"synergy" 쓴 거 삭제했어요... 무섭더라고요' },
    { score: 44, name: '마케터 3년차', text: '점수 낮게 나와서 할미한테 칭찬받았어요 ㅎ' },
  ]

  function getScoreBadgeStyle(score: number) {
    if (score > 70) return { background: 'rgba(192,57,43,0.14)', color: '#C0392B' }
    if (score > 50) return { background: 'rgba(218,165,32,0.14)', color: '#DAA520' }
    return { background: 'rgba(76,175,80,0.14)', color: '#4CAF50' }
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 7 }}>
      {reviews.map(({ score, name, text }, i) => {
        const badge = getScoreBadgeStyle(score)
        return (
          <div key={i} style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '10px 12px', background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          }}>
            <span style={{
              padding: '2px 7px', borderRadius: 6, whiteSpace: 'nowrap',
              ...badge,
              fontSize: '0.72rem', fontWeight: 800,
            }}>{score}점</span>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>{name}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(245,240,232,0.7)' }}>{text}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MitteCta() {
  return (
    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7, opacity: 0.7 }}>
      🍫 미떼는 말이여~ 동서식품 담당자님 보고 계세여?<br />
      <span style={{ color: 'rgba(218,165,32,0.6)' }}>할미떼 × 미떼 콜라보 어떻겄어잉~ 💛</span>
    </div>
  )
}
