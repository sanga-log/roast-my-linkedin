import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '할미떼 👵 — LinkedIn 팩폭 서비스',
  description: '할미의 매운맛 충고 한번 감당해볼텨? 내 LinkedIn 프로필 얼마나 오글거리는지 할미한테 혼나보세요',
  openGraph: {
    title: '할미떼 👵',
    description: '할미떼는 말이여~ 내 LinkedIn 프로필 얼마나 오글거리는지 AI 할미한테 혼나보세요',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
