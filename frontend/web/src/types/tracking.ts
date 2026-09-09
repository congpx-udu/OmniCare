export type ActivityType =
  'walking' | 'running' | 'cycling' | 'gym' | 'yoga' | 'swimming' | 'sports' | 'housework' | 'other'

/** Nhật ký sức khỏe một ngày (GET /tracking/logs) */
export interface HealthLog {
  id: string
  /** yyyy-mm-dd */
  date: string
  weightKg: number | null
  systolic: number | null
  diastolic: number | null
  heartRate: number | null
  glucose: number | null
  sleepHours: number | null
  activityMinutes: number | null
  activityType: ActivityType | null
  /** 1 rất tệ → 5 rất tốt */
  mood: number | null
  note: string | null
  updatedAt: string
}

export type TrendDirection = 'up' | 'down' | 'stable'
export type AlertLevel = 'info' | 'warning' | 'urgent'
export type SuggestionCategory = 'activity' | 'sleep' | 'diet' | 'checkup' | 'other'

export interface AdviceSuggestion {
  title: string
  detail: string
  category: SuggestionCategory
  when: string | null
  done: boolean
}

/** Một lần AI phân tích nhật ký (POST /tracking/analyze, GET /tracking/advice) */
export interface HealthAdvice {
  id: string
  from: string
  to: string
  logCount: number
  summary: string
  trends: Array<{ metric: string; direction: TrendDirection; comment: string }>
  alerts: Array<{ level: AlertLevel; message: string }>
  suggestions: AdviceSuggestion[]
  disclaimer: string
  createdAt: string
}
