'use client'

import { useState, useEffect } from 'react'
import type { Screen, UploadMode, BlockReason, RoastResult } from './lib/types'
import { LandingScreen } from './domains/landing/LandingScreen'
import { ScrapingScreen } from './domains/scraping/ScrapingScreen'
import { BlockedScreen } from './domains/blocked/BlockedScreen'
import { UploadScreen } from './domains/upload/UploadScreen'
import { LoadingScreen } from './domains/loading/LoadingScreen'
import { ResultScreen } from './domains/result/ResultScreen'
import { ErrorScreen } from './domains/error/ErrorScreen'

const MIN_SCRAPING_DISPLAY_MS = 2300

function parseBlockReason(reason?: string): BlockReason {
  if (reason === 'quota_exhausted') return 'quota'
  if (reason === 'overloaded') return 'overloaded'
  return 'api_error'
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [url, setUrl] = useState('')
  const [uploadMode, setUploadMode] = useState<UploadMode>('pdf')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<RoastResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [blockReason, setBlockReason] = useState<BlockReason>('scraping')
  const [stats, setStats] = useState({ totalRoasts: 0, avgScore: 0 })

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setStats).catch(() => { })
  }, [])

  const recordStats = (score: number) => {
    fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score }),
    }).then((r) => r.json()).then(() => {
      setStats((prev) => {
        const newTotal = prev.totalRoasts + 1
        const newAvg = Math.round((prev.avgScore * prev.totalRoasts + score) / newTotal)
        return { totalRoasts: newTotal, avgScore: newAvg }
      })
    }).catch(() => { })
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setErrorMsg('')
    setUrl('')
    setScreen('landing')
  }

  const handleScrapeAttempt = async () => {
    if (!url.includes('linkedin.com')) return
    setScreen('scraping')

    try {
      const [, scrapeRes] = await Promise.all([
        new Promise((r) => setTimeout(r, MIN_SCRAPING_DISPLAY_MS)),
        fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        }),
      ])

      const scrapeData = await scrapeRes.json()

      if (scrapeData.success && scrapeData.profile?.profileText) {
        await analyzeProfileText(scrapeData.profile.profileText)
      } else {
        setBlockReason('scraping')
        setScreen('blocked')
      }
    } catch {
      setBlockReason('scraping')
      setScreen('blocked')
    }
  }

  const analyzeProfileText = async (profileText: string) => {
    setScreen('loading')
    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileText }),
      })
      const data = await res.json()

      if (data.blocked) {
        setBlockReason(parseBlockReason(data.reason))
        setScreen('blocked')
        return
      }

      if (!res.ok) throw new Error(data.error || '분석 실패')
      setResult(data)
      setScreen('result')
      recordStats(data.cringeScore)
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : '알 수 없는 오류')
      setScreen('error')
    }
  }

  const handleFileAnalyze = async () => {
    if (!file) return
    setScreen('loading')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('fileType', uploadMode)
      const res = await fetch('/api/roast', { method: 'POST', body: form })
      const data = await res.json()

      if (data.blocked) {
        setBlockReason(parseBlockReason(data.reason))
        setScreen('blocked')
        return
      }

      if (!res.ok) throw new Error(data.error || '분석 실패')
      setResult(data)
      setScreen('result')
      recordStats(data.cringeScore)
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : '알 수 없는 오류')
      setScreen('error')
    }
  }

  const handleModeChange = (mode: UploadMode) => {
    setUploadMode(mode)
    setFile(null)
  }

  switch (screen) {
    case 'landing':
      return (
        <LandingScreen
          url={url}
          stats={stats}
          onUrlChange={setUrl}
          onScrape={handleScrapeAttempt}
        />
      )

    case 'scraping':
      return <ScrapingScreen url={url} />

    case 'blocked':
      return <BlockedScreen reason={blockReason} onContinue={() => setScreen('upload')} />

    case 'upload':
      return (
        <UploadScreen
          uploadMode={uploadMode}
          file={file}
          onModeChange={handleModeChange}
          onFile={setFile}
          onAnalyze={handleFileAnalyze}
          onBack={reset}
        />
      )

    case 'loading':
      return <LoadingScreen />

    case 'result':
      return result ? (
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{
            padding: '18px 20px 14px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0,
            background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(12px)', zIndex: 10,
          }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>👵 할미의 충고</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              오글 점수: <span style={{ color: 'var(--halmi-gold)', fontWeight: 700 }}>{result.cringeScore}/100</span>
            </span>
          </div>
          <ResultScreen result={result} onRetry={reset} />
        </div>
      ) : null

    case 'error':
      return <ErrorScreen message={errorMsg} onRetry={reset} />
  }
}
