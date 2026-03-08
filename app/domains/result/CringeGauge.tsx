'use client'

import { useState, useEffect } from 'react'

const GAUGE_RADIUS = 80
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS
const ANIMATION_DURATION_MS = 1200

function getScoreColor(score: number) {
  if (score < 35) return '#4CAF50'
  if (score < 60) return '#DAA520'
  if (score < 80) return '#D2691E'
  return '#C0392B'
}

function getScoreLabel(score: number) {
  if (score < 35) return '나쁘지 않구먼 👵'
  if (score < 60) return '할미가 쯧쯧 😤'
  if (score < 80) return '아이구야 이걸 💀'
  return '할미 눈물 난다 😭'
}

export function CringeGauge({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0)
  const offset = GAUGE_CIRCUMFERENCE - (GAUGE_CIRCUMFERENCE * Math.min(displayed, 100)) / 100
  const color = getScoreColor(displayed)

  useEffect(() => {
    let frame: number
    const start = performance.now()

    const animate = (now: number) => {
      const progress = Math.min((now - start) / ANIMATION_DURATION_MS, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(score * easeOut))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="100" cy="100" r={GAUGE_RADIUS}
            fill="none" stroke="rgba(218,165,32,0.1)" strokeWidth="14"
          />
          <circle
            cx="100" cy="100" r={GAUGE_RADIUS}
            fill="none" stroke={color}
            strokeWidth="14" strokeLinecap="round"
            strokeDasharray={GAUGE_CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.3s' }}
            filter="url(#glow)"
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: '3.2rem', fontWeight: 900, color, lineHeight: 1,
            fontFamily: "'Black Han Sans', sans-serif",
            textShadow: `0 0 20px ${color}88`,
          }}>{displayed}</span>
          <span style={{ fontSize: '0.72rem', color: 'rgba(245,240,232,0.35)', marginTop: 4 }}>
            / 100
          </span>
        </div>
      </div>
      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: getScoreColor(score), textAlign: 'center' }}>
        {getScoreLabel(score)}
      </div>
    </div>
  )
}
