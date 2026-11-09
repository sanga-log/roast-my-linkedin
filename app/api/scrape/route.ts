import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { notifyLinkedInVisit } from '../../lib/slack'
import { isRateLimited } from '../../lib/rateLimit'
import { recordEvent, type ScrapeBlockReason } from '../../lib/events'
import { alertServerError } from '../../lib/errorAlert'

// ── LinkedIn 프로필 스크래핑 API Fallback Chain ──────────────
// 모든 API는 RapidAPI 기반 — 하나의 RAPIDAPI_KEY로 여러 API 무료(Basic) 플랜 구독
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

// 문자열 값만 쓴다. "Gates Foundation · undefined", "null, null", "-" 처럼
// 빈 값을 글자로 박아 주는 API가 있어 그런 조각은 지운다. 줄바꿈·연속 공백은 한 칸으로 줄인다
const EMPTY_TEXT = new Set(['null', 'undefined', '-', '—'])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanText(v: any): string {
  if (v && typeof v === 'object' && typeof v.name === 'string') v = v.name
  if (typeof v !== 'string') return ''
  return v.replace(/\s+/g, ' ').trim().split(' · ')
    .map(part => part.split(',').map(x => x.trim()).filter(x => x && !EMPTY_TEXT.has(x)).join(', '))
    .filter(Boolean)
    .join(' · ')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function firstText(...values: any[]): string {
  for (const v of values) {
    const s = cleanText(v)
    if (s) return s
  }
  return ''
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatExperience(items: any[]): string {
  if (!Array.isArray(items)) return ''
  return items.map(item => {
    // 경력을 "직함 at 회사" 같은 문자열 한 줄로 주는 API도 있다
    if (typeof item === 'string') return item
    // schema.org 형식({"@type":"Organization", name, member})은 회사명이 name, 기간·설명이 member 안에 있다
    const member = item.member && typeof item.member === 'object' ? item.member : {}
    const isSchemaOrg = typeof item['@type'] === 'string'
    // title·subtitle·caption 형식(직함·회사·기간). 한 회사에서 직함이 여럿이면
    // breakdown 으로 묶여 회사가 title, 직함이 subComponents 로 온다
    const sub = item.breakdown && Array.isArray(item.subComponents) ? (item.subComponents[0] ?? {}) : null
    const title = firstText(sub ? sub.title : item.title, item.position, item.job_title, item.role, member.roleName)
    const company = firstText(item.company, item.companyName, item.company_name,
      isSchemaOrg ? item.name : '', sub ? item.title : item.subtitle)
    // dateRange 를 {"start":{"year":2000},"end":{}} 객체로 주는 API도 있다
    const range = item.dateRange && typeof item.dateRange === 'object' ? item.dateRange : {}
    const duration = firstText(item.duration, item.date_range, item.dateRange, item.duration_range, item.dates,
      sub ? sub.caption : item.caption)
      || formatPeriod(range.start ?? item.start ?? item.startDate ?? item.start_date ?? member.startDate,
        range.end ?? item.end ?? item.endDate ?? item.end_date ?? member.endDate)
    const desc = typeof item.description === 'string' && item.description ? item.description
      : typeof member.description === 'string' ? member.description : ''
    // 회사도 직함도 없는 빈 항목은 버린다
    const head = [title, company].filter(Boolean).join(' @ ')
    if (!head) return ''
    return `${head}${duration ? ` (${duration})` : ''}${desc ? '\n  ' + desc : ''}`
  }).filter(Boolean).join('\n')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatPeriod(start: any, end: any): string {
  // 날짜를 {"text":"2000","year":2000} 처럼 객체로 주는 API도 있다. 모르는 연도를 0으로 주는 API도 있다
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const text = (v: any) => (v && typeof v === 'object' ? v.text || v.year || '' : v || '')
  const s = text(start)
  const e = text(end)
  if (!s && !e) return ''
  return `${s}–${e}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatEducation(items: any[]): string {
  if (!Array.isArray(items)) return ''
  return items.map(item => {
    if (typeof item === 'string') return item
    const member = item.member && typeof item.member === 'object' ? item.member : {}
    const isSchemaOrg = typeof item['@type'] === 'string'
    // title·subtitle·caption 형식은 학교가 title, 학위·전공이 subtitle, 기간이 caption
    const hasSchoolKey = item.school || item.schoolName || item.school_name
    const school = firstText(item.school, item.schoolName, item.school_name, isSchemaOrg ? item.name : '', item.title)
    const degree = firstText(item.degree, item.degreeName, item.degree_name)
    const field = firstText(item.field, item.fieldOfStudy, item.field_of_study)
    const detail = [degree, field].filter(Boolean).join(' ') || (hasSchoolKey ? '' : cleanText(item.subtitle))
    const range = item.dateRange && typeof item.dateRange === 'object' ? item.dateRange : {}
    const period = (isSchemaOrg ? formatPeriod(member.startDate, member.endDate) : '')
      || firstText(item.caption, item.duration, item.date_range, item.dateRange, item.dates)
      || formatPeriod(range.start ?? item.start ?? item.startDate ?? item.start_date ?? item.startYear,
        range.end ?? item.end ?? item.endDate ?? item.end_date ?? item.endYear)
    const head = [school, detail].filter(Boolean).join(' — ')
    if (!head) return ''
    return `${head}${period ? ` (${period})` : ''}`
  }).filter(Boolean).join('\n')
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

// API마다 프로필을 감싸는 껍데기가 달라서 이름이 있는 객체까지 벗겨 낸다
// data / data.data / profile / response / profiles[0] / 배열 응답 / basic_info
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapProfile(data: any): any {
  let d = Array.isArray(data) ? data[0] : data
  for (let i = 0; i < 3 && d && typeof d === 'object'; i++) {
    const inner = d.data ?? d.profile ?? d.response
      ?? (Array.isArray(d.profiles) ? d.profiles[0] : undefined)
      // {"items":[{type:"profile",…},{type:"summary"}]} 형식(LinkedIntel)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?? (Array.isArray(d.items) ? (d.items.find((x: any) => x?.type === 'profile') ?? d.items[0]) : undefined)
    if (!inner || typeof inner !== 'object') break
    d = Array.isArray(inner) ? inner[0] : inner
  }
  // 이름은 basic_info 안에, 경력·학력은 바깥에 두는 API(LinkedIn Scraper Fast)
  if (d?.basic_info && typeof d.basic_info === 'object') d = { ...d, ...d.basic_info }
  return d
}

// 로그인 벽 페이지를 그대로 긁어 온 응답은 이름 자리에 이런 문구가 들어온다
const AUTHWALL_NAMES = /^(join linkedin|linkedin|sign up|sign in|log in)\b/i

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function genericExtract(data: any): ProfileData | null {
  // success: false 인 경우 무시
  if (data?.success === false) return null
  const d = unwrapProfile(data)
  if (!d || (typeof d === 'object' && Object.keys(d).length === 0)) return null
  const rawName = d.fullName || d.full_name || d.fullname || d.name
    || safe(() => `${d.firstName || d.first_name} ${d.lastName || d.last_name}`)
  const name = typeof rawName === 'string' ? rawName : ''
  if (name.trim().length < 2 || name === 'undefined undefined' || AUTHWALL_NAMES.test(name.trim())) return null
  const headline = d.headline || d.title || d.occupation || d.job_title || ''
  const summary = d.summary || d.about || d.description || ''
  const experience = formatExperience(
    d.experiences || d.experience || d.work_experience || d.position || d.positions || []
  )
  const education = formatEducation(
    d.educations || d.education || []
  )
  const skills = formatSkills(d.skills || [])
  const p: ProfileData = { name: name.trim(), headline, summary, experience, education, skills, raw: '' }
  p.raw = buildProfileText(p)
  return p
}

// 2026-11-09 10개 모두 실제 호출로 프로필 응답을 확인했다. 무료(Basic) 한도 합계 월 1,000회
// 경력·학력까지 오는 API를 앞에, 이름·헤드라인만 오는 API를 맨 뒤에 둔다
// 실패한 API는 403·502·400이나 빈 결과를 돌려주고 다음으로 넘어간다
// 뺀 API(2026-11-09): linkedin-profile-scraper9(구독돼 있는데 403), linkedin-lead-enrichment(공개 프로필도 빈 결과),
//   linkedin-api8(rockapis, "This version of the service is no longer available" — 서비스 종료),
//   linkedin-data-api8(zscraper, 동작하지만 이름·헤드라인만 와서 10개에서 밀림)
const SCRAPERS: ScraperConfig[] = [
  // 1) LinkedIn Scraper (Real-Time Fast) — GET, username 기반, 월 50회
  {
    name: 'LinkedIn Scraper Fast',
    host: 'linkedin-scraper-api-real-time-fast-affordable.p.rapidapi.com',
    method: 'GET',
    getUrl: (username) =>
      `https://linkedin-scraper-api-real-time-fast-affordable.p.rapidapi.com/profile/detail?username=${encodeURIComponent(username)}`,
    extractProfile: genericExtract,
  },
  // 2) LinkedIn Profile Scraper (benthepythondev0) — POST, JSON body, 배열 응답, 월 50회
  {
    name: 'LinkedIn Profile Scraper Profiles',
    host: 'linkedin-profile-scraper11.p.rapidapi.com',
    method: 'POST',
    contentType: 'application/json',
    getUrl: () => 'https://linkedin-profile-scraper11.p.rapidapi.com/',
    getBody: (username) => JSON.stringify({ profileUrls: [linkedinUrl(username)], maxProfiles: 1 }),
    extractProfile: genericExtract,
  },
  // 3) Unlimited LinkedIn Scraper — GET, URL 기반, 월 100회
  {
    name: 'Unlimited LinkedIn Scraper',
    host: 'unlimited-linkedin-scraper.p.rapidapi.com',
    method: 'GET',
    getUrl: (username) =>
      `https://unlimited-linkedin-scraper.p.rapidapi.com/api/linkedin/profile?url=${encodeURIComponent(linkedinUrl(username))}&use_cache=false`,
    extractProfile: genericExtract,
  },
  // 4) LinkedIn - Profiles, Companies & Post Search — GET, URL 기반, 월 50회
  {
    name: 'LinkedIn Profiles & Post Search',
    host: 'linkedin-profiles-companies-post-search.p.rapidapi.com',
    method: 'GET',
    getUrl: (username) =>
      `https://linkedin-profiles-companies-post-search.p.rapidapi.com/profile?url=${encodeURIComponent(linkedinUrl(username))}`,
    extractProfile: genericExtract,
  },
  // 5) LinkedIn Profile Scraper API (scrapier) — GET, URL 기반, 월 300회
  {
    name: 'LinkedIn Profile Scraper API',
    host: 'linkedin-profile-scraper-api3.p.rapidapi.com',
    method: 'GET',
    getUrl: (username) =>
      `https://linkedin-profile-scraper-api3.p.rapidapi.com/v2/linkedin-profile/?urls=${encodeURIComponent(linkedinUrl(username))}`,
    extractProfile: genericExtract,
  },
  // 6) Linkedin Data Scraper API (apibuilderz) — POST, JSON body, 월 50회
  //    경력·학력까지 온다. 실제 응답은 dateRange 가 객체, subtitle 에 "· undefined" 가 붙는다
  {
    name: 'Linkedin Data Scraper API',
    host: 'realtime-linkedin-fresh-data.p.rapidapi.com',
    method: 'POST',
    contentType: 'application/json',
    getUrl: () => 'https://realtime-linkedin-fresh-data.p.rapidapi.com/person',
    getBody: (username) => JSON.stringify({ link: linkedinUrl(username) }),
    extractProfile: genericExtract,
  },
  // 7) LinkedIn Scraper API (codenest) — GET, username 을 slug 로 넘긴다, 월 100회, 초당 2회
  //    직함이 role, 기간이 dates("2000 - Present\n  26 years")로 온다
  {
    name: 'LinkedIn Scraper API People Info',
    host: 'linkedin-scraper-api5.p.rapidapi.com',
    method: 'GET',
    getUrl: (username) =>
      `https://linkedin-scraper-api5.p.rapidapi.com/api/v1/people/info?slug=${encodeURIComponent(username)}`,
    extractProfile: genericExtract,
  },
  // 8) LinkedIn Data API (elis-lab) — GET, username 을 경로에 넣는다, 월 200회
  //    응답이 8초 걸린 적이 있어 10초 제한에 가깝다. 학위 자리에 "-" 가 온다
  {
    name: 'LinkedIn Data API Profiles',
    host: 'linkedin-data-api7.p.rapidapi.com',
    method: 'GET',
    getUrl: (username) =>
      `https://linkedin-data-api7.p.rapidapi.com/profiles/${encodeURIComponent(username)}`,
    extractProfile: genericExtract,
  },
  // 9) LinkedIn Scraper API [Stable] (trustgraph-labs) — GET, username 기반, 월 50회
  //    회사·학교가 {name} 객체, 기간이 dateRange 객체로 온다. 첫 호출은 25초 걸린 적이 있다(두 번째는 4초)
  {
    name: 'LinkedIn Scraper API Stable',
    host: 'linkedin-scraper-api-stable1.p.rapidapi.com',
    method: 'GET',
    getUrl: (username) =>
      `https://linkedin-scraper-api-stable1.p.rapidapi.com/v1/profiles/details/by-username?username=${encodeURIComponent(username)}`,
    extractProfile: genericExtract,
  },
  // 10) Fresh LinkedIn Scraper API — GET, username 기반, 월 50회
  //    이름·헤드라인만 온다
  {
    name: 'Fresh LinkedIn Scraper',
    host: 'fresh-linkedin-scraper-api.p.rapidapi.com',
    method: 'GET',
    getUrl: (username) =>
      `https://fresh-linkedin-scraper-api.p.rapidapi.com/api/v1/user/profile?username=${encodeURIComponent(username)}`,
    extractProfile: genericExtract,
  },
]

// 한글 username은 스크래퍼들이 못 읽는 경우가 많아 차단 사유와 함께 따로 센다
function hasKoreanUsername(url: string) {
  try {
    return /[가-힣]/.test(decodeURIComponent(url))
  } catch {
    return false
  }
}

async function respondBlocked(
  reason: ScrapeBlockReason,
  url: string,
  init?: ResponseInit,
  extra?: Record<string, unknown>,
) {
  await recordEvent({ type: 'scrape_blocked', reason, hasKoreanUsername: hasKoreanUsername(url) })
  return NextResponse.json({ success: false, blocked: true, reason, ...extra }, init)
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url || !url.includes('linkedin.com/in/')) {
    return respondBlocked('invalid_url', String(url ?? ''))
  }

  if (await isRateLimited(req, 'scrape')) {
    return respondBlocked('rate_limited', url, { status: 429 })
  }

  notifyLinkedInVisit(url)

  const username = extractUsername(url)
  if (!username) {
    return respondBlocked('invalid_url', url)
  }

  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) {
    console.error('RAPIDAPI_KEY not set')
    await alertServerError({ source: '/api/scrape', title: 'RAPIDAPI_KEY 환경변수 없음' })
    return respondBlocked('no_api_key', url)
  }

  const errors: string[] = []
  // 429(무료 할당량 소진)로 실패한 API 수. 전부 429면 차단이 아니라 할당량 문제로 안내한다
  let quotaExhaustedCount = 0

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
        quotaExhaustedCount++
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
      await recordEvent({ type: 'scrape_succeeded', scraper: scraper.name })

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

  // 모든 API 실패. 전부 429면 무료 할당량을 다 쓴 것이라 화면에 할당량 문구를 띄운다.
  // 하나라도 403·빈 결과·타임아웃 같은 다른 이유로 실패했으면 LinkedIn 차단 문구를 띄운다
  const quotaExhausted = quotaExhaustedCount === SCRAPERS.length
  console.log(`[Scrape] All APIs failed (quotaExhausted=${quotaExhausted}):`, errors)
  Sentry.captureMessage(quotaExhausted ? 'All scraping API quotas exhausted' : 'All scraping APIs failed', {
    level: 'error',
    extra: { errors, username },
  })
  // username은 개인정보라 슬랙 알림에는 API별 실패 사유만 담는다
  await alertServerError({
    source: '/api/scrape',
    title: quotaExhausted ? '스크래핑 API 무료 할당량 전부 소진' : '스크래핑 API 전부 실패 (무료 할당량 소진 가능성)',
    detail: errors.join(' / '),
  })
  return respondBlocked(quotaExhausted ? 'quota_exhausted' : 'all_apis_exhausted', url, undefined, { errors })
}
