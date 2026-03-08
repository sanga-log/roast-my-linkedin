export type Screen = 'landing' | 'scraping' | 'blocked' | 'upload' | 'loading' | 'result' | 'error'

export type UploadMode = 'pdf' | 'image'

export type BlockReason = 'scraping' | 'quota' | 'overloaded' | 'api_error'

export interface RoastResult {
  cringeScore: number
  roastText: string
  detectedWords: string[]
  tips: string[]
}
