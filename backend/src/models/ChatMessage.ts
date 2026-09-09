import { Schema, model, type InferSchemaType } from 'mongoose'

export const CHAT_MODES = ['food', 'symptom'] as const
export type ChatMode = (typeof CHAT_MODES)[number]

const chatMessageSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Hai luồng chat trong một khung: gợi ý ẩm thực / cảm nhận cơ thể (lịch sử tách riêng)
    mode: { type: String, enum: CHAT_MODES, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    // Bối cảnh tại thời điểm gửi (tin của user): thời tiết, vị trí, cảm nhận
    context: { type: Schema.Types.Mixed },
    // Dữ liệu có cấu trúc từ AI (tin của assistant): risk_level, meals, possible_conditions...
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

chatMessageSchema.index({ user: 1, mode: 1, createdAt: -1 })

export type ChatMessageDoc = InferSchemaType<typeof chatMessageSchema>
export const ChatMessage = model('ChatMessage', chatMessageSchema)
