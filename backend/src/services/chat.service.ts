import { z } from 'zod'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { ChatMessage, type ChatMode } from '../models/ChatMessage.js'
import { ApiError } from '../utils/ApiError.js'
import type { ChatHistoryQuery, SendChatInput } from '../validators/chat.validator.js'
import { getWeather, type WeatherSnapshot } from './context.service.js'
import { getProfile } from './profile.service.js'

/** Số tin gần nhất (cả hai vai) gửi kèm cho AI để giữ mạch hội thoại */
const HISTORY_FOR_AI = 10
const AI_TIMEOUT_MS = 30_000

// ---------- Schema response của AI service (validate trước khi dùng) ----------

const mealSchema = z.object({
  name: z.string(),
  why: z.string(),
  ingredients: z.array(z.string()).default([]),
  notes: z.string().nullable().default(null),
})

const conditionSchema = z.object({ name: z.string(), why: z.string() })

const aiResponseSchema = z.object({
  mode: z.enum(['food', 'symptom']),
  reply: z.string().min(1),
  risk_level: z.enum(['none', 'home', 'doctor', 'emergency']).default('none'),
  possible_conditions: z.array(conditionSchema).default([]),
  suggested_specialty: z.string().nullable().default(null),
  facility_type: z.string().nullable().default(null),
  follow_up_questions: z.array(z.string()).default([]),
  meals: z.array(mealSchema).default([]),
  activities: z.array(z.string()).default([]),
  disclaimer: z.string(),
  model: z.string(),
  latency_ms: z.number(),
})

type AiResponse = z.infer<typeof aiResponseSchema>

/** Phần có cấu trúc lưu vào ChatMessage.meta và trả cho client */
export interface AssistantMeta {
  riskLevel: AiResponse['risk_level']
  possibleConditions: AiResponse['possible_conditions']
  suggestedSpecialty: string | null
  facilityType: string | null
  followUpQuestions: string[]
  meals: AiResponse['meals']
  activities: string[]
  model: string
  latencyMs: number
}

export interface PublicChatMessage {
  id: string
  mode: ChatMode
  role: 'user' | 'assistant'
  content: string
  meta: AssistantMeta | null
  createdAt: string
}

interface MessageSource {
  _id: unknown
  mode: string
  role: string
  content: string
  meta?: unknown
  createdAt?: Date
}

function toPublicMessage(m: MessageSource): PublicChatMessage {
  return {
    id: String(m._id),
    mode: m.mode as ChatMode,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    meta: m.role === 'assistant' && m.meta ? (m.meta as AssistantMeta) : null,
    createdAt: m.createdAt ? m.createdAt.toISOString() : new Date().toISOString(),
  }
}

// ---------- Gom ngữ cảnh (ẩn danh: không tên, SĐT, email) ----------

function weatherContext(w: WeatherSnapshot) {
  return {
    location: w.location.name,
    temp: w.current.temp,
    feels_like: w.current.feelsLike,
    humidity: w.current.humidity,
    description: w.current.description,
    wind_kmh: w.current.windKmh,
    rain_chance: w.daily[0]?.pop ?? null,
  }
}

async function safeWeather(location: SendChatInput['location']) {
  if (!location) return null
  try {
    return await getWeather(location)
  } catch (err) {
    // Thời tiết chỉ là ngữ cảnh phụ; lỗi thời tiết không được chặn chat
    logger.warn({ err }, 'weather context unavailable for chat')
    return null
  }
}

async function callAi(payload: unknown): Promise<AiResponse> {
  let res: Response
  try {
    res = await fetch(`${env.AI_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    })
  } catch (err) {
    logger.warn({ err }, 'AI service unreachable')
    throw new ApiError(504, 'Trợ lý AI đang bận, vui lòng thử lại sau')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null
    logger.warn({ status: res.status, detail: body?.detail }, 'AI service error')
    if (res.status === 503) {
      throw new ApiError(503, body?.detail ?? 'Trợ lý AI chưa sẵn sàng')
    }
    throw new ApiError(502, 'Trợ lý AI trả lời lỗi, vui lòng thử lại')
  }
  const parsed = aiResponseSchema.safeParse(await res.json())
  if (!parsed.success) {
    logger.warn({ issues: parsed.error.issues.slice(0, 3) }, 'AI response mismatch')
    throw new ApiError(502, 'Phản hồi của trợ lý AI không hợp lệ')
  }
  return parsed.data
}

// ---------- Public API ----------

export async function sendMessage(userId: string, input: SendChatInput) {
  const [profile, weather, recent] = await Promise.all([
    getProfile(userId),
    safeWeather(input.location),
    ChatMessage.find({ user: userId, mode: input.mode })
      .sort({ createdAt: -1 })
      .limit(HISTORY_FOR_AI)
      .lean(),
  ])

  const history = recent.reverse().map((m) => ({ role: m.role, content: m.content }))

  const aiPayload = {
    mode: input.mode,
    messages: [...history, { role: 'user', content: input.message }],
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
    feeling: input.feeling ?? null,
    // Giai đoạn 4 sẽ đưa tóm tắt MedicalRecord vào đây
    records_summary: null,
  }

  const ai = await callAi(aiPayload)

  const meta: AssistantMeta = {
    riskLevel: ai.risk_level,
    possibleConditions: ai.possible_conditions,
    suggestedSpecialty: ai.suggested_specialty,
    facilityType: ai.facility_type,
    followUpQuestions: ai.follow_up_questions,
    meals: ai.meals,
    activities: ai.activities,
    model: ai.model,
    latencyMs: ai.latency_ms,
  }

  const [userMsg, assistantMsg] = await ChatMessage.create([
    {
      user: userId,
      mode: input.mode,
      role: 'user',
      content: input.message,
      context: {
        feeling: input.feeling ?? null,
        weather: weather ? weatherContext(weather) : null,
      },
    },
    { user: userId, mode: input.mode, role: 'assistant', content: ai.reply, meta },
  ])

  return {
    userMessage: toPublicMessage(userMsg),
    assistantMessage: toPublicMessage(assistantMsg),
    // Yêu cầu AI-04: mọi response chat kèm disclaimer
    disclaimer: ai.disclaimer,
  }
}

/** Lịch sử một luồng, thứ tự cũ → mới */
export async function getHistory(userId: string, query: ChatHistoryQuery) {
  const docs = await ChatMessage.find({ user: userId, mode: query.mode })
    .sort({ createdAt: -1 })
    .limit(query.limit)
    .lean()
  return docs.reverse().map(toPublicMessage)
}

export async function clearHistory(userId: string, mode: ChatMode) {
  const result = await ChatMessage.deleteMany({ user: userId, mode })
  return { deleted: result.deletedCount }
}
