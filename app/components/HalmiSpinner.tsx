'use client'

interface HalmiSpinnerProps {
  size: number
  halmiSize?: number
}

export function HalmiSpinner({ size, halmiSize }: HalmiSpinnerProps) {
  const r = Math.round(size * 0.425)
  const strokeWidth = Math.round(size * 0.065)
  const center = size / 2
  const imgSize = halmiSize ?? Math.round(size * 0.6)

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ animation: 'spin 1.2s linear infinite' }}>
        <circle
          cx={center} cy={center} r={r}
          fill="none" stroke="rgba(218,165,32,0.1)" strokeWidth={strokeWidth}
        />
        <circle
          cx={center} cy={center} r={r}
          fill="none" stroke="var(--halmi-gold)" strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${Math.round(r * 2.35)} ${Math.round(r * 3.95)}`}
          style={{ filter: 'drop-shadow(0 0 5px #DAA520)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          src="/halmi.png"
          alt=""
          style={{
            width: imgSize, height: imgSize,
            objectFit: 'contain',
            animation: 'wobble 1s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  )
}
