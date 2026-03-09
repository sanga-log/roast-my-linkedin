import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

// ── LinkedIn 프로필 스크래핑 API Fallback Chain ──────────────
// 모든 API는 RapidAPI 기반 — 하나의 RAPIDAPI_KEY로 여러 API 무료 구독
// 순서대로 시도하고, 실패(429/에러)하면 다음 API로 넘어감

interface ScraperConfig {
  name: string
  host: string
  method: 'GET' | 'POST'
  getUrl: (username: string) => string
  getBody?: (username: string) => string
  contentType?: string
  extractProfile: (data: unknown) => ProfileData | null
}

interface ProfileData {
  name: string
  headline: string
  summary: string
  experience: string
  education: string
  skills: string
  raw: string // Claude에게 보낼 전체 텍스트
}

function extractUsername(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([^/?#]+)/)
  return match ? match[1] : null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safe(fn: () => any, fallback = ''): string {
  try {
    const result = fn()
    return result ?? fallback
  } catch {
    return fallback
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatExperience(items: any[]): string {
  if (!Array.isArray(items)) return ''
  return items.map(item => {
    const title = item.title || item.position || ''
    const company = item.company || item.companyName || item.company_name || ''
    const duration = item.duration || item.date_range || item.dateRange || ''
    const desc = item.description || ''
    return `${title} @ ${company} (${duration})${desc ? '\n  ' + desc : ''}`
  }).join('\n')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatEducation(items: any[]): string {
  if (!Array.isArray(items)) return ''
  return items.map(item => {
    const school = item.school || item.schoolName || item.school_name || ''
    const degree = item.degree || item.degreeName || item.degree_name || ''
    const field = item.field || item.fieldOfStudy || item.field_of_study || ''
    return `${school} — ${degree} ${field}`.trim()
  }).join('\n')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatSkills(items: any[]): string {
  if (!Array.isArray(items)) return ''
  return items.map(item => typeof item === 'string' ? item : item.name || item.skill || '').filter(Boolean).join(', ')
}

function buildProfileText(p: ProfileData): string {
  const sections = [
    `이름: ${p.name}`,
    `직함/헤드라인: ${p.headline}`,
    p.summary ? `자기소개/요약:\n${p.summary}` : '',
    p.experience ? `경력:\n${p.experience}` : '',
    p.education ? `학력:\n${p.education}` : '',
    p.skills ? `스킬: ${p.skills}` : '',
  ].filter(Boolean)
  return sections.join('\n\n')
}

function linkedinUrl(username: string) {
  return `https://www.linkedin.com/in/${username}/`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function genericExtract(data: any): ProfileData | null {
  // success: false 인 경우 무시
  if (data?.success === false) return null
  const d = data?.data || data
  if (!d || (typeof d === 'object' && Object.keys(d).length === 0)) return null
  const name = d.fullName || d.full_name || d.name
    || safe(() => `${d.firstName || d.first_name} ${d.lastName || d.last_name}`)
  if (!name || name.trim().length < 2 || name === 'undefined undefined') return null
  const headline = d.headline || d.title || d.occupation || ''
  const summary = d.summary || d.about || d.description || ''
  const experience = formatExperience(
    d.experiences || d.experience || d.position || d.positions || []
  )
  const education = formatEducation(
    d.educations || d.education || []
  )
  const skills = formatSkills(d.skills || [])
  const p: ProfileData = { name: name.trim(), headline, summary, experience, education, skills, raw: '' }
  p.raw = buildProfileText(p)
  return p
}

const SCRAPERS: ScraperConfig[] = [
  // 1) Unlimited LinkedIn Scraper — GET, URL 기반
  {
    name: 'Unlimited LinkedIn Scraper',
    host: 'unlimited-linkedin-scraper.p.rapidapi.com',
    method: 'GET',
    getUrl: (username) =>
      `https://unlimited-linkedin-scraper.p.rapidapi.com/api/linkedin/profile?url=${encodeURIComponent(linkedinUrl(username))}&use_cache=false`,
    extractProfile: genericExtract,
  },
  // 2) Z-LinkedIn API — GET, username 기반
  {
    name: 'Z-LinkedIn API',
    host: 'z-linkedin.p.rapidapi.com',
    method: 'GET',
    getUrl: (username) =>
      `https://z-linkedin.p.rapidapi.com/api/profile?username=${encodeURIComponent(username)}&includeAdditionalSummary=false`,
    extractProfile: genericExtract,
  },
  // 3) Li Data Scraper — GET, URL 파라미터
  {
    name: 'Li Data Scraper',
    host: 'li-data-scraper.p.rapidapi.com',
    method: 'GET',
    getUrl: (username) =>
      `https://li-data-scraper.p.rapidapi.com/about-this-profile?url=${encodeURIComponent(linkedinUrl(username))}`,
    extractProfile: genericExtract,
  },
  // 4) LinkedIn Person Profile Scraper — POST, JSON body
  {
    name: 'LinkedIn Person Profile Scraper',
    host: 'linkedin-person-profile-scraper.p.rapidapi.com',
    method: 'POST',
    contentType: 'application/json',
    getUrl: () => 'https://linkedin-person-profile-scraper.p.rapidapi.com/api/v1/linkedin/person/',
    getBody: (username) => JSON.stringify({ url: linkedinUrl(username) }),
    extractProfile: genericExtract,
  },
  // 5) Fresh LinkedIn Scraper API — GET, username 기반
  {
    name: 'Fresh LinkedIn Scraper',
    host: 'fresh-linkedin-scraper-api.p.rapidapi.com',
    method: 'GET',
    getUrl: (username) =>
      `https://fresh-linkedin-scraper-api.p.rapidapi.com/api/v1/user/profile?username=${encodeURIComponent(username)}`,
    extractProfile: genericExtract,
  },
  // 6) LinkedIn Scraper (Real-Time Fast) — GET, username 기반
  {
    name: 'LinkedIn Scraper Fast',
    host: 'linkedin-scraper-api-real-time-fast-affordable.p.rapidapi.com',
    method: 'GET',
    getUrl: (username) =>
      `https://linkedin-scraper-api-real-time-fast-affordable.p.rapidapi.com/profile/detail?username=${encodeURIComponent(username)}`,
    extractProfile: genericExtract,
  },
  // 7) Fresh LinkedIn Profile Data API — GET, username 기반
  {
    name: 'Fresh LinkedIn Profile Data API',
    host: 'fresh-linkedin-profile-data-api.p.rapidapi.com',
    method: 'GET',
    getUrl: (username) =>
      `https://fresh-linkedin-profile-data-api.p.rapidapi.com/api/profile?username=${encodeURIComponent(username)}`,
    extractProfile: genericExtract,
  },
  // 8) LinkedIn Data Scraper — POST, form 기반
  {
    name: 'LinkedIn Data Scraper',
    host: 'linkedin-data-scraper1.p.rapidapi.com',
    method: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    getUrl: () => 'https://linkedin-data-scraper1.p.rapidapi.com/get_user_data.php',
    getBody: (username) => `url=${encodeURIComponent(linkedinUrl(username))}`,
    extractProfile: genericExtract,
  },
]

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url || !url.includes('linkedin.com/in/')) {
    return NextResponse.json({ success: false, blocked: true, reason: 'invalid_url' })
  }

  const username = extractUsername(url)
  if (!username) {
    return NextResponse.json({ success: false, blocked: true, reason: 'invalid_url' })
  }

  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) {
    console.error('RAPIDAPI_KEY not set')
    return NextResponse.json({ success: false, blocked: true, reason: 'no_api_key' })
  }

  const errors: string[] = []

  for (const scraper of SCRAPERS) {
    try {
      console.log(`[Scrape] Trying: ${scraper.name}`)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const headers: Record<string, string> = {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': scraper.host,
      }
      if (scraper.contentType) {
        headers['Content-Type'] = scraper.contentType
      }

      const fetchOptions: RequestInit = {
        method: scraper.method,
        headers,
        signal: controller.signal,
      }
      if (scraper.method === 'POST' && scraper.getBody) {
        fetchOptions.body = scraper.getBody(username)
      }

      const response = await fetch(scraper.getUrl(username), fetchOptions)
      clearTimeout(timeout)

      // 429 = 할당량 초과 → 다음 API 시도
      if (response.status === 429) {
        errors.push(`${scraper.name}: 429 rate limited`)
        console.log(`[Scrape] ${scraper.name}: 429 — trying next`)
        continue
      }

      // 403/401 = 구독 안됨 or 키 문제 → 다음 API 시도
      if (response.status === 403 || response.status === 401) {
        errors.push(`${scraper.name}: ${response.status} auth error`)
        console.log(`[Scrape] ${scraper.name}: ${response.status} — trying next`)
        continue
      }

      if (!response.ok) {
        errors.push(`${scraper.name}: ${response.status}`)
        console.log(`[Scrape] ${scraper.name}: ${response.status} — trying next`)
        continue
      }

      const data = await response.json()
      console.log(`[Scrape] ${scraper.name} raw sample:`, JSON.stringify(data).slice(0, 500))

      // 일부 API는 200이지만 에러 메시지를 반환
      if (data?.error || data?.message?.toLowerCase?.().includes?.('error') || data?.status === 'error') {
        errors.push(`${scraper.name}: API returned error`)
        console.log(`[Scrape] ${scraper.name}: API error in response — trying next`)
        continue
      }

      const profile = scraper.extractProfile(data)

      if (!profile || !profile.name || profile.raw.length < 30) {
        errors.push(`${scraper.name}: insufficient data`)
        console.log(`[Scrape] ${scraper.name}: no usable data — trying next`)
        continue
      }

      console.log(`[Scrape] Success with ${scraper.name}: ${profile.name}`)

      return NextResponse.json({
        success: true,
        profile: {
          name: profile.name,
          headline: profile.headline,
          summary: profile.summary,
          experience: profile.experience,
          education: profile.education,
          skills: profile.skills,
          profileText: profile.raw,
        },
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown'
      errors.push(`${scraper.name}: ${msg}`)
      console.log(`[Scrape] ${scraper.name}: exception — ${msg}`)
      continue
    }
  }

  // 모든 API 실패
  console.log(`[Scrape] All APIs failed:`, errors)
  Sentry.captureMessage('All scraping APIs failed', {
    level: 'error',
    extra: { errors, username },
  })
  return NextResponse.json({
    success: false,
    blocked: true,
    reason: 'all_apis_exhausted',
    errors,
  })
}
