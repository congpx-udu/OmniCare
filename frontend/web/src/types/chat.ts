/** 'health': luồng hợp nhất đang dùng; food/symptom chỉ còn trong lịch sử cũ */
export type ChatMode = 'health' | 'food' | 'symptom'
export type ChatIntent = 'symptom' | 'food' | 'general'
export type RiskLevel = 'none' | 'home' | 'doctor' | 'emergency'

export interface MealSuggestion {
  name: string
  why: string
  ingredients: string[]
  /** Nguyên liệu cần mua thêm ngoài tủ bếp (Tủ bếp mức 1); tin cũ trong lịch sử không có trường này */
  missing?: string[]
  notes: string | null
}

export interface PossibleCondition {
  name: string
  why: string
}

/** Dữ liệu có cấu trúc kèm tin của trợ lý (backend lưu trong ChatMessage.meta) */
export interface AssistantMeta {
  /** Luồng health: lượt này AI hiểu người dùng hỏi gì (tin cũ không có) */
  intent?: ChatIntent
  riskLevel: RiskLevel
  possibleConditions: PossibleCondition[]
  suggestedSpecialty: string | null
  facilityType: string | null
  followUpQuestions: string[]
  meals: MealSuggestion[]
  activities: string[]
  model: string
  latencyMs: number
}

/** Ảnh người dùng gửi kèm; lấy qua GET /chat/:id/image/:index (sau xác thực) */
export interface ChatAttachment {
  index: number
  mime: string
}

export interface ChatMessage {
  id: string
  mode: ChatMode
  role: 'user' | 'assistant'
  content: string
  meta: AssistantMeta | null
  attachments: ChatAttachment[]
  /** Chỉ ở tin đang gửi (optimistic): object URL xem trước ảnh, chưa có id trên server */
  previews?: string[]
  createdAt: string
}

export interface SendChatResult {
  userMessage: ChatMessage
  assistantMessage: ChatMessage
  disclaimer: string
}
