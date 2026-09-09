import { z } from 'zod'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { ApiError } from '../utils/ApiError.js'
import type { WeatherQuery } from '../validators/context.validator.js'
import { forecastNote, getWeather, localTime, weatherContext } from './context.service.js'
import { getProfile } from './profile.service.js'

/**
 * "Ảnh hưởng đến bạn": thời tiết hôm nay + hồ sơ → lưu ý cá nhân theo buổi trong ngày.
 * Cache theo (user, tọa độ làm tròn, buổi trong ngày, thời điểm sửa hồ sơ) trong 30 phút để tiết kiệm LLM.
 */

const CACHE_TTL_MS = 30 * 60 * 1000
const AI_TIMEOUT_MS = 70_000

const insightSchema = z.object({
  summary: z.string().min(1),
  tips: z.array(z.object({ title: z.string(), detail: z.string() })).default([]),
  meal_idea: z.string().nullable().default(null),
  activity_idea: z.string().nullable().default(null),
  disclaimer: z.string(),
  model: z.string(),
  latency_ms: z.number(),
})

export interface WeatherInsight {
  summary: string
  tips: Array<{ title: string; detail: string }>
  mealIdea: string | null
  activityIdea: string | null
  timeOfDay: string
  disclaimer: string
  generatedAt: string
  cached: boolean
}

const cache = new Map<string, { value: WeatherInsight; expiresAt: number }>()

function pruneCache() {
  if (cache.size < 500) return
  const now = Date.now()
  for (const [k, v] of cache) if (v.expiresAt <= now) cache.delete(k)
}

export async function getWeatherInsight(userId: string, query: WeatherQuery) {
  const [weather, profile] = await Promise.all([getWeather(query), getProfile(userId)])
  const when = localTime(weather)
  const key = [
    userId,
    weather.location.lat.toFixed(2),
    weather.location.lon.toFixed(2),
    when.time_of_day,
    profile.updatedAt ?? 'none',
  ].join('|')

  const hit = cache.get(key)
  if (hit && hit.expiresAt > Date.now()) return { ...hit.value, cached: true }

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
    weather: weatherContext(weather),
    forecast_note: forecastNote(weather),
    local_time: when.local_time,
    time_of_day: when.time_of_day,
  }

  let res: Response
  try {
    res = await fetch(`${env.AI_SERVICE_URL}/insights/weather`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    })
  } catch (err) {
    logger.warn({ err }, 'AI service unreachable (insight)')
    throw new ApiError(504, 'Trợ lý AI đang bận, vui lòng thử lại sau')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null
    logger.warn({ status: res.status, detail: body?.detail }, 'AI insight error')
    if (res.status === 503) throw new ApiError(503, body?.detail ?? 'Trợ lý AI chưa sẵn sàng')
    throw new ApiError(502, 'Trợ lý AI trả lời lỗi, vui lòng thử lại')
  }
  const parsed = insightSchema.safeParse(await res.json())
  if (!parsed.success) {
    logger.warn({ issues: parsed.error.issues.slice(0, 3) }, 'AI insight mismatch')
    throw new ApiError(502, 'Phản hồi của trợ lý AI không hợp lệ')
  }

  const value: WeatherInsight = {
    summary: parsed.data.summary,
    tips: parsed.data.tips.slice(0, 4),
    mealIdea: parsed.data.meal_idea,
    activityIdea: parsed.data.activity_idea,
    timeOfDay: when.time_of_day,
    disclaimer: parsed.data.disclaimer,
    generatedAt: new Date().toISOString(),
    cached: false,
  }
  pruneCache()
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
  return value
}
