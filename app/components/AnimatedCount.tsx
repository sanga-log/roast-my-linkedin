'use client'

import { useState, useEffect } from 'react'

const ANIMATION_DURATION_MS = 800

export function AnimatedCount({ target }: { target: number }) {
  const [val, setVal] = useState(0)

  useEffect(() => {
    let frame: number
    const start = performance.now()

    const animate = (now: number) => {
      const progress = Math.min((now - start) / ANIMATION_DURATION_MS, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(target * easeOut))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [target])

  return <>{val.toLocaleString()}</>
}
