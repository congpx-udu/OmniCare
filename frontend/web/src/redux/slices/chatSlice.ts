import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { logout } from '@/redux/slices/authSlice'
import { chatService, type SendChatPayload } from '@/services/chatService'
import type { ChatMessage, ChatMode, SendChatResult } from '@/types'
import { getApiErrorMessage } from '@/utils/apiError'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

interface ThreadState {
  messages: ChatMessage[]
  /** Tải lịch sử */
  status: Status
  /** Đang chờ AI trả lời */
  sending: boolean
  error: string | null
}

interface ChatState {
  activeMode: ChatMode
  threads: Record<ChatMode, ThreadState>
}

const emptyThread = (): ThreadState => ({
  messages: [],
  status: 'idle',
  sending: false,
  error: null,
})

const pendingId = (requestId: string) => `pending-${requestId}`

const initialState: ChatState = {
  activeMode: 'health',
  threads: { health: emptyThread(), food: emptyThread(), symptom: emptyThread() },
}

export const fetchHistory = createAsyncThunk<
  { mode: ChatMode; messages: ChatMessage[] },
  ChatMode,
  { rejectValue: { mode: ChatMode; message: string } }
>('chat/fetchHistory', async (mode, { rejectWithValue }) => {
  try {
    const res = await chatService.history(mode)
    return { mode, messages: res.data }
  } catch (err) {
    return rejectWithValue({ mode, message: getApiErrorMessage(err, 'Không tải được lịch sử') })
  }
})

export const sendChat = createAsyncThunk<
  { mode: ChatMode; result: SendChatResult },
  SendChatPayload,
  { rejectValue: { mode: ChatMode; message: string } }
>('chat/send', async (payload, { rejectWithValue }) => {
  try {
    const res = await chatService.send(payload)
    return { mode: payload.mode, result: res.data }
  } catch (err) {
    return rejectWithValue({
      mode: payload.mode,
      message: getApiErrorMessage(err, 'Trợ lý AI chưa trả lời được, thử lại sau'),
    })
  }
})

export const clearThread = createAsyncThunk<
  ChatMode,
  ChatMode,
  { rejectValue: { mode: ChatMode; message: string } }
>('chat/clear', async (mode, { rejectWithValue }) => {
  try {
    await chatService.clear(mode)
    return mode
  } catch (err) {
    return rejectWithValue({ mode, message: getApiErrorMessage(err, 'Không xóa được lịch sử') })
  }
})

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveMode(state, action: PayloadAction<ChatMode>) {
      state.activeMode = action.payload
    },
    clearChatError(state, action: PayloadAction<ChatMode>) {
      state.threads[action.payload].error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Đăng xuất: bỏ toàn bộ nội dung chat khỏi bộ nhớ
      .addCase(logout, () => initialState)
      .addCase(fetchHistory.pending, (state, action) => {
        const t = state.threads[action.meta.arg]
        t.status = 'loading'
        t.error = null
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        const t = state.threads[action.payload.mode]
        t.status = 'succeeded'
        t.messages = action.payload.messages
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        const mode = action.payload?.mode ?? action.meta.arg
        const t = state.threads[mode]
        t.status = 'failed'
        t.error = action.payload?.message ?? 'Không tải được lịch sử'
      })
      .addCase(sendChat.pending, (state, action) => {
        const { mode, message } = action.meta.arg
        const t = state.threads[mode]
        t.sending = true
        t.error = null
        // Hiện ngay tin của người dùng (optimistic); thay bằng bản đã lưu khi AI trả lời
        t.messages.push({
          id: pendingId(action.meta.requestId),
          mode,
          role: 'user',
          content: message,
          meta: null,
          attachments: [],
          previews: action.meta.arg.previews,
          createdAt: new Date().toISOString(),
        })
      })
      .addCase(sendChat.fulfilled, (state, action) => {
        const t = state.threads[action.payload.mode]
        t.sending = false
        t.messages = t.messages.filter((m) => m.id !== pendingId(action.meta.requestId))
        t.messages.push(action.payload.result.userMessage, action.payload.result.assistantMessage)
      })
      .addCase(sendChat.rejected, (state, action) => {
        const mode = action.payload?.mode ?? action.meta.arg.mode
        const t = state.threads[mode]
        t.sending = false
        t.messages = t.messages.filter((m) => m.id !== pendingId(action.meta.requestId))
        t.error = action.payload?.message ?? 'Trợ lý AI chưa trả lời được, thử lại sau'
      })
      .addCase(clearThread.fulfilled, (state, action) => {
        state.threads[action.payload] = { ...emptyThread(), status: 'succeeded' }
      })
      .addCase(clearThread.rejected, (state, action) => {
        const mode = action.payload?.mode ?? action.meta.arg
        state.threads[mode].error = action.payload?.message ?? 'Không xóa được lịch sử'
      })
  },
})

export const { setActiveMode, clearChatError } = chatSlice.actions
export default chatSlice.reducer
