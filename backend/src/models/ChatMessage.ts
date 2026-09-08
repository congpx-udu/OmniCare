import { Schema, model } from 'mongoose'

const chatMessageSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    // Bối cảnh tại thời điểm chat: thời tiết, vị trí, cảm nhận
    context: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

export const ChatMessage = model('ChatMessage', chatMessageSchema)
