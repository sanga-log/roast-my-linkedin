'use client'

import { UploadZone } from './UploadZone'
import type { UploadMode } from '../../lib/types'

interface UploadScreenProps {
  uploadMode: UploadMode
  file: File | null
  onModeChange: (mode: UploadMode) => void
  onFile: (f: File) => void
  onAnalyze: () => void
  onBack: () => void
}

export function UploadScreen({ uploadMode, file, onModeChange, onFile, onAnalyze, onBack }: UploadScreenProps) {
  return (
    <div style={{ minHeight: '100dvh', maxWidth: 520, margin: '0 auto', paddingBottom: 40, animation: 'slideUp 0.4s ease' }}>
      <StickyHeader onBack={onBack} />

      <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <ModeSelector activeMode={uploadMode} onSelect={onModeChange} />

        {uploadMode === 'image' && <ScreenshotGuide />}

        <div>
          <SectionLabel>파일 업로드</SectionLabel>
          <UploadZone mode={uploadMode} onFile={onFile} />
        </div>

        <SubmitButton hasFile={!!file} onClick={onAnalyze} />
      </div>
    </div>
  )
}

function StickyHeader({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      padding: '18px 20px 14px', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 10,
      position: 'sticky', top: 0,
      background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(12px)', zIndex: 10,
    }}>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', color: 'var(--text-dim)',
        cursor: 'pointer', fontSize: '1.1rem', padding: '2px 6px 2px 0',
      }}>←</button>
      <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>👵 할미한테 프로필 보여주기</span>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)',
      letterSpacing: '0.1em', marginBottom: 10, textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
}

function ModeSelector({ activeMode, onSelect }: { activeMode: UploadMode; onSelect: (m: UploadMode) => void }) {
  const modes = [
    { mode: 'pdf' as const, icon: '💻', title: 'PC — PDF', desc: '더보기 → PDF로 저장' },
    { mode: 'image' as const, icon: '📱', title: '모바일 — 스크린샷', desc: '정보 섹션 캡처' },
  ]

  return (
    <div>
      <SectionLabel>방법 선택</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {modes.map(({ mode, icon, title, desc }) => {
          const isActive = activeMode === mode
          return (
            <button key={mode} onClick={() => onSelect(mode)} style={{
              padding: '14px 12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
              background: isActive ? 'rgba(139,69,19,0.12)' : 'rgba(255,255,255,0.02)',
              border: `1.5px solid ${isActive ? 'var(--halmi-gold)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
            }}>
              <div style={{ fontSize: '1.3rem', marginBottom: 5 }}>{icon}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: 2, fontFamily: "'Noto Sans KR', sans-serif" }}>{title}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: "'Noto Sans KR', sans-serif" }}>{desc}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ScreenshotGuide() {
  const steps = [
    { step: '1️⃣', title: '이름 + 직함', desc: '프로필 진입 → 이름/직함 화면 캡처' },
    { step: '2️⃣', title: '"정보" 섹션 (핵심!)', desc: '"더보기" 펼친 상태로 전체 캡처' },
  ]

  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '14px 16px', animation: 'fadeIn 0.3s ease',
    }}>
      <SectionLabel>📸 어디를 찍어야 하나요?</SectionLabel>
      {steps.map(({ step, title, desc }) => (
        <div key={step} style={{
          display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8,
          padding: '9px 11px', background: 'rgba(218,165,32,0.05)',
          border: '1px solid rgba(218,165,32,0.15)', borderRadius: 8,
        }}>
          <span style={{ fontSize: '1rem' }}>{step}</span>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>{title}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SubmitButton({ hasFile, onClick }: { hasFile: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={!hasFile} style={{
      width: '100%', padding: '16px',
      background: hasFile ? 'linear-gradient(135deg, #8B4513, #D2691E)' : 'rgba(255,255,255,0.05)',
      border: 'none', borderRadius: 'var(--radius)',
      color: hasFile ? '#FFF8E7' : 'var(--text-muted)', fontSize: '1rem', fontWeight: 800,
      cursor: hasFile ? 'pointer' : 'not-allowed',
      boxShadow: hasFile ? '0 8px 24px rgba(139,69,19,0.35)' : 'none',
      transition: 'all 0.2s', fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      {hasFile ? '👵 할미한테 혼나러 가기' : '파일을 먼저 올려주세요'}
    </button>
  )
}
