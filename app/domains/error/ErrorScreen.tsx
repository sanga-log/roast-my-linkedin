'use client'

interface ErrorScreenProps {
  message: string
  onRetry: () => void
}

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20, padding: '40px 24px', animation: 'fadeIn 0.4s ease',
    }}>
      <div style={{ fontSize: '3rem', animation: 'shake 0.5s ease' }}>😵</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>할미가 쓰러졌어요</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{message}</div>
      </div>
      <button onClick={onRetry} style={{
        padding: '14px 28px',
        background: 'linear-gradient(135deg, #8B4513, #D2691E)',
        border: 'none', borderRadius: 'var(--radius)',
        color: '#FFF8E7', fontSize: '0.9rem', fontWeight: 700,
        cursor: 'pointer', fontFamily: "'Noto Sans KR', sans-serif",
      }}>
        할미 다시 깨우기
      </button>
    </div>
  )
}
