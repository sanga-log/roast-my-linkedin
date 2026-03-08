'use client'

import { useState, useRef, useCallback } from 'react'
import type { UploadMode } from '../../lib/types'

interface UploadZoneProps {
  mode: UploadMode
  onFile: (f: File) => void
}

export function UploadZone({ mode, onFile }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    const isPdfMode = mode === 'pdf'
    if (isPdfMode && file.type !== 'application/pdf') return
    if (!isPdfMode && !file.type.startsWith('image/')) return

    setFileName(file.name)

    if (!isPdfMode) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }

    onFile(file)
  }, [mode, onFile])

  const borderColor = dragging
    ? 'var(--halmi-gold)'
    : fileName ? '#4CAF50' : 'rgba(218,165,32,0.2)'

  const bgColor = dragging
    ? 'rgba(218,165,32,0.05)'
    : fileName ? 'rgba(76,175,80,0.05)' : 'rgba(255,255,255,0.02)'

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
      }}
      style={{
        border: `2px dashed ${borderColor}`,
        borderRadius: 'var(--radius)', padding: '32px 20px',
        textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
        background: bgColor,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={mode === 'pdf' ? '.pdf,application/pdf' : 'image/*'}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {preview ? (
        <>
          <img src={preview} alt="" style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 10, marginBottom: 10 }} />
          <div style={{ fontSize: '0.82rem', color: '#4CAF50', fontWeight: 600 }}>✓ {fileName}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>다시 클릭해서 변경</div>
        </>
      ) : fileName ? (
        <>
          <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: '0.85rem', color: '#4CAF50', fontWeight: 600 }}>✓ {fileName}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>다시 클릭해서 변경</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>{mode === 'pdf' ? '📋' : '📸'}</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 6 }}>
            {mode === 'pdf' ? 'PDF 파일을 드래그하거나 클릭' : '스크린샷을 드래그하거나 클릭'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {mode === 'pdf' ? 'LinkedIn → 더보기 → PDF로 저장' : '정보 섹션이 보이게 스크린샷 후 업로드'}
          </div>
        </>
      )}
    </div>
  )
}
