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
}

/** Chat gọi LLM mất vài giây; timeout riêng dài hơn mặc định 10s của axiosClient */
const CHAT_TIMEOUT_MS = 40_000

export const chatService = {
  send: (payload: SendChatPayload) =>
    axiosClient.post<ApiResponse<SendChatResult>, ApiResponse<SendChatResult>>(
      ENDPOINTS.CHAT.SEND,
      payload,
      { timeout: CHAT_TIMEOUT_MS },
    ),
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
