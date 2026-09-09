import { z } from 'zod'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { HealthAdvice } from '../models/HealthAdvice.js'
import { HealthLog, type ActivityType } from '../models/HealthLog.js'
import { ApiError } from '../utils/ApiError.js'
import type {
  AnalyzeInput,
  ListAdviceQuery,
  ListLogsQuery,
  UpsertLogInput,
} from '../validators/tracking.validator.js'
import { getWeather, localTime, weatherContext, type WeatherSnapshot } from './context.service.js'
import { getProfile } from './profile.service.js'

const AI_TIMEOUT_MS = 70_000
const DAY_MS = 24 * 3600 * 1000

// ---------- Public shapes ----------

export interface PublicLog {
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
  mood: number | null
  note: string | null
  updatedAt: string
}

export interface PublicAdvice {
  id: string
  from: string
  to: string
  logCount: number
  summary: string
  trends: Array<{ metric: string; direction: 'up' | 'down' | 'stable'; comment: string }>
  alerts: Array<{ level: 'info' | 'warning' | 'urgent'; message: string }>
  suggestions: Array<{
    title: string
    detail: string
    category: 'activity' | 'sleep' | 'diet' | 'checkup' | 'other'
    when: string | null
    done: boolean
  }>
  disclaimer: string
  createdAt: string
}

const DISCLAIMER =
  'OmniCare không thay thế chẩn đoán y khoa. Hãy gặp bác sĩ khi có triệu chứng nghiêm trọng.'

const ymd = (d: Date) => d.toISOString().slice(0, 10)
const parseYmd = (s: string) => new Date(`${s}T00:00:00.000Z`)

interface LogSource {
  _id: unknown
  date: Date
  weightKg?: number | null
  systolic?: number | null
  diastolic?: number | null
  heartRate?: number | null
  glucose?: number | null
  sleepHours?: number | null
  activityMinutes?: number | null
  activityType?: string | null
  mood?: number | null
  note?: string | null
  updatedAt?: Date
}

function toPublicLog(l: LogSource): PublicLog {
  return {
    id: String(l._id),
    date: ymd(l.date),
    weightKg: l.weightKg ?? null,
    systolic: l.systolic ?? null,
    diastolic: l.diastolic ?? null,
    heartRate: l.heartRate ?? null,
    glucose: l.glucose ?? null,
    sleepHours: l.sleepHours ?? null,
    activityMinutes: l.activityMinutes ?? null,
    activityType: (l.activityType as ActivityType | null | undefined) ?? null,
    mood: l.mood ?? null,
    note: l.note ?? null,
    updatedAt: (l.updatedAt ?? new Date()).toISOString(),
  }
}

interface AdviceSource {
  _id: unknown
  from: Date
  to: Date
  logCount: number
  summary: string
  trends?: Array<{ metric?: string | null; direction?: string | null; comment?: string | null }>
  alerts?: Array<{ level?: string | null; message?: string | null }>
  suggestions?: Array<{
    title: string
    detail: string
    category?: string | null
    when?: string | null
    done?: boolean | null
  }>
  createdAt?: Date
}

function toPublicAdvice(a: AdviceSource): PublicAdvice {
  return {
    id: String(a._id),
    from: ymd(a.from),
    to: ymd(a.to),
    logCount: a.logCount,
    summary: a.summary,
    trends: (a.trends ?? []).map((t) => ({
      metric: t.metric ?? '',
      direction: (t.direction as 'up' | 'down' | 'stable') ?? 'stable',
      comment: t.comment ?? '',
    })),
    alerts: (a.alerts ?? []).map((x) => ({
      level: (x.level as 'info' | 'warning' | 'urgent') ?? 'info',
      message: x.message ?? '',
    })),
    suggestions: (a.suggestions ?? []).map((s) => ({
      title: s.title,
      detail: s.detail,
      category: (s.category as PublicAdvice['suggestions'][number]['category']) ?? 'other',
      when: s.when ?? null,
      done: Boolean(s.done),
    })),
    disclaimer: DISCLAIMER,
    createdAt: (a.createdAt ?? new Date()).toISOString(),
  }
}

// ---------- Logs ----------

/** Upsert nhật ký một ngày. Trường undefined giữ nguyên, null xóa. */
export async function upsertLog(userId: string, date: string, input: UpsertLogInput) {
  const day = parseYmd(date)
  if (day.getTime() > Date.now() + DAY_MS)
    throw ApiError.badRequest('Không ghi nhật ký cho tương lai')
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue
    if (v === null) $unset[k] = 1
    else $set[k] = v
  }
  const update: Record<string, unknown> = { $setOnInsert: { user: userId, date: day } }
  if (Object.keys($set).length) update.$set = $set
  if (Object.keys($unset).length) update.$unset = $unset
  const doc = await HealthLog.findOneAndUpdate({ user: userId, date: day }, update, {
    new: true,
    upsert: true,
    runValidators: true,
  }).lean()
  return toPublicLog(doc!)
}

export async function listLogs(userId: string, query: ListLogsQuery) {
  const filter: Record<string, unknown> = { user: userId }
  if (query.from || query.to) {
    const range: Record<string, Date> = {}
    if (query.from) range.$gte = parseYmd(query.from)
    if (query.to) range.$lte = parseYmd(query.to)
    filter.date = range
  }
  const docs = await HealthLog.find(filter).sort({ date: -1 }).limit(query.limit).lean()
  // Trả cũ → mới cho biểu đồ
  return docs.reverse().map(toPublicLog)
}

export async function deleteLog(userId: string, date: string) {
  const res = await HealthLog.findOneAndDelete({ user: userId, date: parseYmd(date) })
  if (!res) throw ApiError.notFound('Không có nhật ký ngày này')
  return { deleted: true }
}

// ---------- Phân tích AI ----------

const aiSchema = z.object({
  summary: z.string().min(1),
  trends: z
    .array(
      z.object({
        metric: z.string(),
        direction: z.enum(['up', 'down', 'stable']),
        comment: z.string(),
      }),
    )
    .default([]),
  alerts: z
    .array(z.object({ level: z.enum(['info', 'warning', 'urgent']), message: z.string() }))
    .default([]),
  suggestions: z
    .array(
      z.object({
        title: z.string(),
        detail: z.string(),
        category: z.enum(['activity', 'sleep', 'diet', 'checkup', 'other']).default('other'),
        when: z.string().nullable().default(null),
      }),
    )
    .default([]),
  disclaimer: z.string(),
  model: z.string(),
  latency_ms: z.number(),
})

async function safeWeather(location: AnalyzeInput['location']): Promise<WeatherSnapshot | null> {
  if (!location) return null
  try {
    return await getWeather(location)
  } catch (err) {
    logger.warn({ err }, 'weather unavailable for tracking analysis')
    return null
  }
}

export async function analyze(userId: string, input: AnalyzeInput) {
  const to = new Date()
  const from = new Date(to.getTime() - input.days * DAY_MS)
  const [logs, profile, weather] = await Promise.all([
    HealthLog.find({ user: userId, date: { $gte: from } })
      .sort({ date: 1 })
      .lean(),
    getProfile(userId),
    safeWeather(input.location),
  ])
  if (logs.length === 0) {
    throw ApiError.badRequest(
      'Chưa có nhật ký nào trong khoảng này. Hãy nhập chỉ số hôm nay trước.',
    )
  }
  const when = localTime(weather)
  const payload = {
    profile: {
      age: profile.age,
      gender: profile.gender,
      height_cm: profile.heightCm,
      weight_kg: profile.weightKg,
      bmi: profile.bmi,
      chronic_conditions: profile.chronicConditions,
      allergies: profile.allergies,
    },
    weather: weather ? weatherContext(weather) : null,
    local_time: when.local_time,
    time_of_day: when.time_of_day,
    logs: logs.map((l) => ({
      date: ymd(l.date),
      weight_kg: l.weightKg ?? null,
      systolic: l.systolic ?? null,
      diastolic: l.diastolic ?? null,
      heart_rate: l.heartRate ?? null,
      glucose: l.glucose ?? null,
      sleep_hours: l.sleepHours ?? null,
      activity_minutes: l.activityMinutes ?? null,
      activity_type: l.activityType ?? null,
      mood: l.mood ?? null,
      note: l.note ?? null,
    })),
  }

  let res: Response
  try {
    res = await fetch(`${env.AI_SERVICE_URL}/insights/tracking`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    })
  } catch (err) {
    logger.warn({ err }, 'AI service unreachable (tracking)')
    throw new ApiError(504, 'Trợ lý AI đang bận, vui lòng thử lại sau')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null
    logger.warn({ status: res.status, detail: body?.detail }, 'AI tracking error')
    if (res.status === 503) throw new ApiError(503, body?.detail ?? 'Trợ lý AI chưa sẵn sàng')
    throw new ApiError(502, 'Trợ lý AI trả lời lỗi, vui lòng thử lại')
  }
  const parsed = aiSchema.safeParse(await res.json())
  if (!parsed.success) {
    logger.warn({ issues: parsed.error.issues.slice(0, 3) }, 'AI tracking mismatch')
    throw new ApiError(502, 'Phản hồi của trợ lý AI không hợp lệ')
  }

  const advice = await HealthAdvice.create({
    user: userId,
    from: logs[0].date,
    to: logs[logs.length - 1].date,
    logCount: logs.length,
    summary: parsed.data.summary,
    trends: parsed.data.trends,
    alerts: parsed.data.alerts,
    suggestions: parsed.data.suggestions.map((s) => ({ ...s, done: false })),
    model: parsed.data.model,
  })
  return toPublicAdvice(advice)
}

export async function listAdvice(userId: string, query: ListAdviceQuery) {
  const docs = await HealthAdvice.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(query.limit)
    .lean()
  return docs.map(toPublicAdvice)
}

export async function setSuggestionDone(userId: string, id: string, index: number, done: boolean) {
  const advice = await HealthAdvice.findOne({ _id: id, user: userId })
  if (!advice) throw ApiError.notFound('Không tìm thấy phân tích')
  const s = advice.suggestions[index]
  if (!s) throw ApiError.notFound('Không tìm thấy đề xuất')
  s.done = done
  await advice.save()
  return toPublicAdvice(advice)
}
