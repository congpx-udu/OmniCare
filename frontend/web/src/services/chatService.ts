import { axiosClient, ENDPOINTS } from '@/api'
import type {
  ApiResponse,
  ChatMessage,
  ChatMode,
  SendChatResult,
  WeatherLocationQuery,
} from '@/types'

export interface SendChatPayload {
  mode: ChatMode
  message: string
  feeling?: string
  location?: WeatherLocationQuery
  /** Tủ bếp mức 1: nguyên liệu đang có (chỉ luồng food), không lưu lại */
  pantry?: string[]
  /** Ảnh kèm tin (≤ 4, JPEG/PNG/WEBP ≤ 10MB) */
  images?: File[]
  /** Object URL xem trước cho tin optimistic (frontend tự tạo/thu hồi) */
  previews?: string[]
}

/** Chat gọi LLM mất vài giây; timeout riêng dài hơn mặc định 10s của axiosClient */
const CHAT_TIMEOUT_MS = 75_000

export const chatService = {
  send: ({ images, previews: _previews, ...payload }: SendChatPayload) => {
    // Có ảnh → multipart; trường có cấu trúc gửi dạng JSON string (backend parse lại)
    if (images && images.length > 0) {
      const form = new FormData()
      form.append('mode', payload.mode)
      form.append('message', payload.message)
      if (payload.feeling) form.append('feeling', payload.feeling)
      if (payload.location) form.append('location', JSON.stringify(payload.location))
      if (payload.pantry?.length) form.append('pantry', JSON.stringify(payload.pantry))
      for (const f of images) form.append('images', f)
      return axiosClient.post<ApiResponse<SendChatResult>, ApiResponse<SendChatResult>>(
        ENDPOINTS.CHAT.SEND,
        form,
        { timeout: CHAT_TIMEOUT_MS },
      )
    }
    return axiosClient.post<ApiResponse<SendChatResult>, ApiResponse<SendChatResult>>(
      ENDPOINTS.CHAT.SEND,
      payload,
      { timeout: CHAT_TIMEOUT_MS },
    )
  },
  image: (id: string, index: number) =>
    axiosClient.get<Blob, Blob>(ENDPOINTS.CHAT.IMAGE(id, index), { responseType: 'blob' }),
  history: (mode: ChatMode, limit = 40) =>
    axiosClient.get<ApiResponse<ChatMessage[]>, ApiResponse<ChatMessage[]>>(
      ENDPOINTS.CHAT.HISTORY,
      { params: { mode, limit } },
    ),
  clear: (mode: ChatMode) =>
    axiosClient.delete<ApiResponse<{ deleted: number }>, ApiResponse<{ deleted: number }>>(
      ENDPOINTS.CHAT.HISTORY,
      { params: { mode } },
    ),
}
