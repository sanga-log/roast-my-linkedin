'use client'

import { useState } from 'react'
import { CringeGauge } from './CringeGauge'
import type { RoastResult } from '../../lib/types'

const SHARE_URL = 'https://halmidae.vercel.app'
const COPY_FEEDBACK_DURATION_MS = 2500

interface ResultScreenProps {
  result: RoastResult
  onRetry: () => void
}

export function ResultScreen({ result, onRetry }: ResultScreenProps) {
  const [copied, setCopied] = useState(false)
  const paragraphs = result.roastText.split('\n').filter((p) => p.trim())

  const handleShare = async () => {
    const text = `할미한테 LinkedIn 이렇게 까였어요 👵 (오글 점수: ${result.cringeScore}/100)\n\n${result.roastText.slice(0, 120)}...\n\n너도 할미한테 혼나봐 👉 ${SHARE_URL}`
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch { /* 사용자가 공유 취소 — 무시 */ }
      return
    }

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS)
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: 40 }}>
      <ScoreSection score={result.cringeScore} />

      {result.detectedWords?.length > 0 && (
        <ClicheSection words={result.detectedWords} />
      )}

      <RoastSection paragraphs={paragraphs} />

      {result.tips?.length > 0 && (
        <TipsSection tips={result.tips} />
      )}

      <HalmiCheer />

      <ActionButtons
        copied={copied}
        onShare={handleShare}
        onRetry={onRetry}
      />

      <FeedbackSection />
    </div>
  )
}

function ScoreSection({ score }: { score: number }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(139,69,19,0.1), rgba(218,165,32,0.06))',
      borderBottom: '1px solid rgba(218,165,32,0.15)',
      padding: '36px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <CringeGauge score={score} />
    </div>
  )
}

function ClicheSection({ words }: { words: string[] }) {
  return (
    <div style={{ padding: '20px 20px 0' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 10, textTransform: 'uppercase' }}>
        💀 할미가 찾아낸 허세 단어들
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {words.map((w, i) => (
          <span key={i} style={{
            padding: '3px 10px',
            background: 'rgba(210,105,30,0.12)', border: '1px solid rgba(210,105,30,0.25)',
            borderRadius: 20, fontSize: '0.78rem', color: '#D2691E', fontWeight: 600,
            animation: `pop 0.3s ease ${i * 0.05}s both`,
          }}>{w}</span>
        ))}
      </div>
    </div>
  )
}

function RoastSection({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div style={{ padding: '20px 20px 0' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>
        👵 할미의 매운맛 충고
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(218,165,32,0.12)',
        borderRadius: 'var(--radius)', padding: '18px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {paragraphs.map((p, i) => (
          <p key={i} style={{
            fontSize: '0.92rem', lineHeight: 1.8,
            color: 'var(--text)',
            animation: `slideUp 0.4s ease ${i * 0.08}s both`,
          }}>{p}</p>
        ))}
      </div>
    </div>
  )
}

function TipsSection({ tips }: { tips: string[] }) {
  return (
    <div style={{ padding: '18px 20px 0' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>
        💝 그래도 할미가 알려주는 팁
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tips.map((tip, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '12px 14px',
            animation: `slideUp 0.4s ease ${i * 0.1 + 0.3}s both`,
          }}>
            <span style={{
              width: 22, height: 22, minWidth: 22, borderRadius: '50%',
              background: 'rgba(218,165,32,0.15)', border: '1px solid rgba(218,165,32,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.68rem', fontWeight: 800, color: 'var(--halmi-gold)',
            }}>{i + 1}</span>
            <span style={{ fontSize: '0.86rem', lineHeight: 1.6, color: 'rgba(245,240,232,0.8)' }}>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HalmiCheer() {
  return (
    <div style={{
      margin: '18px 20px 0',
      background: 'linear-gradient(135deg, rgba(218,165,32,0.08), rgba(139,69,19,0.06))',
      border: '1px solid rgba(218,165,32,0.15)',
      borderRadius: 'var(--radius-sm)', padding: '16px 18px',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: '0.92rem', lineHeight: 1.8, color: 'rgba(245,240,232,0.75)',
        fontStyle: 'italic',
      }}>
        &ldquo;할미가 싫은소리 많이 했지만 말이여,<br />
        니는 충분히 잘하고 있는 사람이여.<br />
        그거 잊지 말고 살아야 하는겨.&rdquo;
      </p>
      <p style={{
        fontSize: '0.78rem', color: 'rgba(218,165,32,0.6)',
        marginTop: 8, fontWeight: 600,
      }}>
        할미는 니가 자랑스러워유 👵💛
      </p>
    </div>
  )
}

function FeedbackSection() {
  const [feedback, setFeedback] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSubmit = async () => {
    if (!feedback.trim() || status === 'sending') return
    setStatus('sending')
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: feedback.trim() }),
      })
      setStatus('sent')
      setFeedback('')
    } catch {
      setStatus('idle')
    }
  }

  if (status === 'sent') {
    return (
      <div style={{
        margin: '16px 20px 0', padding: '18px 14px',
        background: 'linear-gradient(135deg, rgba(218,165,32,0.1), rgba(139,69,19,0.08))',
        border: '1px solid rgba(218,165,32,0.25)',
        borderRadius: 'var(--radius-sm)', textAlign: 'center',
        animation: 'fadeIn 0.4s ease',
      }}>
        <p style={{ fontSize: '1.2rem', marginBottom: 6 }}>🤎</p>
        <p style={{
          fontSize: '0.95rem', fontWeight: 600,
          color: 'var(--halmi-gold)', lineHeight: 1.6,
        }}>
          어머~ 고마워유!
        </p>
        <p style={{
          fontSize: '0.8rem', color: 'rgba(245,240,232,0.5)', marginTop: 4,
        }}>
          할미가 꼼꼼히 읽어볼겨
        </p>
      </div>
    )
  }

  return (
    <div style={{
      margin: '16px 20px 0', padding: '14px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
    }}>
      <p style={{
        fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
        letterSpacing: '0.08em', marginBottom: 10, textTransform: 'uppercase',
      }}>
        💬 할미한테 한마디
      </p>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="재밌었어유~ / 이런 기능도 넣어주세유 / 버그 신고..."
        maxLength={500}
        style={{
          width: '100%', minHeight: 60, padding: '10px 12px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text)', fontSize: '0.84rem', lineHeight: 1.6,
          resize: 'vertical', outline: 'none',
          fontFamily: "'Noto Sans KR', sans-serif",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(218,165,32,0.3)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
      />
      <button
        onClick={handleSubmit}
        disabled={!feedback.trim() || status === 'sending'}
        style={{
          marginTop: 8, width: '100%', padding: '10px',
          background: feedback.trim() ? 'rgba(218,165,32,0.12)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${feedback.trim() ? 'rgba(218,165,32,0.25)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          color: feedback.trim() ? 'var(--halmi-gold)' : 'var(--text-muted)',
          fontSize: '0.82rem', fontWeight: 600, cursor: feedback.trim() ? 'pointer' : 'default',
          fontFamily: "'Noto Sans KR', sans-serif",
          transition: 'all 0.2s',
        }}
      >
        {status === 'sending' ? '보내는 중...' : '할미한테 전달하기'}
      </button>
    </div>
  )
}

function ActionButtons({ copied, onShare, onRetry }: { copied: boolean; onShare: () => void; onRetry: () => void }) {
  return (
    <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button onClick={onShare} style={{
        width: '100%', padding: '16px',
        background: copied
          ? 'linear-gradient(135deg, #4CAF50, #388E3C)'
          : 'linear-gradient(135deg, #8B4513, #D2691E)',
        border: 'none', borderRadius: 'var(--radius)', color: '#FFF8E7',
        fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
        boxShadow: copied ? '0 8px 24px rgba(76,175,80,0.3)' : '0 8px 24px rgba(139,69,19,0.4)',
        transition: 'all 0.2s', fontFamily: "'Noto Sans KR', sans-serif",
      }}>
        {copied ? '✓ 복사됨! 동료한테 혼나게 해봐요' : '👵 이 충고를 동료한테 공유하기'}
      </button>
      <button onClick={onRetry} style={{
        width: '100%', padding: '14px',
        background: 'transparent', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', color: 'var(--text-dim)',
        fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
        fontFamily: "'Noto Sans KR', sans-serif",
      }}>
        다른 프로필 할미한테 보여주기
      </button>
    </div>
  )
}
