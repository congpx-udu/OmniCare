import { z } from 'zod'
import { CHAT_MODES } from '../models/ChatMessage.js'

const modeSchema = z.enum(CHAT_MODES, { error: 'Luồng chat không hợp lệ' })

const locationSchema = z.union([
  z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }),
  z.object({ city: z.string().trim().min(2).max(80) }),
])

export const sendChatSchema = z.object({
  body: z.object({
    mode: modeSchema,
    message: z.string().trim().min(1, 'Vui lòng nhập nội dung').max(2000, 'Tối đa 2000 ký tự'),
    /** Cảm nhận hôm nay (ô riêng trên khung chat), tùy chọn */
    feeling: z.string().trim().max(300).optional(),
    /** Vị trí để lấy thời tiết; không gửi thì AI không có ngữ cảnh thời tiết */
    location: locationSchema.optional(),
  }),
})

export const chatHistorySchema = z.object({
  query: z.object({
    mode: modeSchema,
    limit: z.coerce.number().int().min(1).max(100).default(40),
  }),
})

export const clearHistorySchema = z.object({
  query: z.object({ mode: modeSchema }),
})

export type SendChatInput = z.infer<typeof sendChatSchema>['body']
export type ChatHistoryQuery = z.infer<typeof chatHistorySchema>['query']
export type ClearHistoryQuery = z.infer<typeof clearHistorySchema>['query']
