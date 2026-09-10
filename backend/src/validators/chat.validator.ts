import { z } from 'zod'
import { CHAT_MODES } from '../models/ChatMessage.js'

const modeSchema = z.enum(CHAT_MODES, { error: 'Luồng chat không hợp lệ' })

const locationSchema = z.union([
  z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }),
  z.object({ city: z.string().trim().min(2).max(80) }),
])

/** Body multipart (khi gửi kèm ảnh) chỉ có chuỗi: chấp nhận JSON string cho các trường có cấu trúc */
const jsonIfString = (v: unknown) => {
  if (typeof v !== 'string') return v
  try {
    return JSON.parse(v) as unknown
  } catch {
    return v
  }
}

export const sendChatSchema = z.object({
  body: z.object({
    mode: modeSchema,
    message: z.string().trim().min(1, 'Vui lòng nhập nội dung').max(2000, 'Tối đa 2000 ký tự'),
    /** Cảm nhận hôm nay (ô riêng trên khung chat), tùy chọn */
    feeling: z.string().trim().max(300).optional(),
    /** Vị trí để lấy thời tiết; không gửi thì AI không có ngữ cảnh thời tiết */
    location: z.preprocess(jsonIfString, locationSchema.optional()),
    /** Tủ bếp mức 1: nguyên liệu đang có (chỉ luồng food), không lưu riêng */
    pantry: z.preprocess(
      jsonIfString,
      z
        .array(z.string().trim().min(1).max(40, 'Mỗi nguyên liệu tối đa 40 ký tự'))
        .max(30, 'Tối đa 30 nguyên liệu')
        .optional(),
    ),
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

/** Ảnh đính kèm một tin nhắn (chỉ chủ sở hữu) */
export const chatImageSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'ID không hợp lệ'),
    index: z.coerce.number().int().min(0).max(3).default(0),
  }),
})

export type SendChatInput = z.infer<typeof sendChatSchema>['body']
export type ChatHistoryQuery = z.infer<typeof chatHistorySchema>['query']
export type ClearHistoryQuery = z.infer<typeof clearHistorySchema>['query']
export type ChatImageParams = z.infer<typeof chatImageSchema>['params']
