import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { logout } from '@/redux/slices/authSlice'
import { trackingService, type UpsertLogPayload } from '@/services/trackingService'
import type { HealthAdvice, HealthLog, WeatherLocationQuery } from '@/types'
import { getApiErrorMessage } from '@/utils/apiError'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

interface TrackingState {
  logs: HealthLog[]
  logsStatus: Status
  logsError: string | null
  saving: boolean
  saveError: string | null
  advice: HealthAdvice[]
  adviceStatus: Status
  analyzing: boolean
  analyzeError: string | null
}

const initialState: TrackingState = {
  logs: [],
  logsStatus: 'idle',
  logsError: null,
  saving: false,
  saveError: null,
  advice: [],
  adviceStatus: 'idle',
  analyzing: false,
  analyzeError: null,
}

const msg = (err: unknown, fallback: string) => getApiErrorMessage(err, fallback)

export const fetchLogs = createAsyncThunk<HealthLog[], number | undefined, { rejectValue: string }>(
  'tracking/fetchLogs',
  async (limit, { rejectWithValue }) => {
    try {
      return (await trackingService.logs({ limit: limit ?? 90 })).data
    } catch (err) {
      return rejectWithValue(msg(err, 'Không tải được nhật ký'))
    }
  },
)

export const saveLog = createAsyncThunk<
  HealthLog,
  { date: string; payload: UpsertLogPayload },
  { rejectValue: string }
>('tracking/saveLog', async ({ date, payload }, { rejectWithValue }) => {
  try {
    return (await trackingService.upsertLog(date, payload)).data
  } catch (err) {
    return rejectWithValue(msg(err, 'Lưu nhật ký thất bại'))
  }
})

export const removeLog = createAsyncThunk<string, string, { rejectValue: string }>(
  'tracking/removeLog',
  async (date, { rejectWithValue }) => {
    try {
      await trackingService.deleteLog(date)
      return date
    } catch (err) {
      return rejectWithValue(msg(err, 'Xóa nhật ký thất bại'))
    }
  },
)

export const fetchAdvice = createAsyncThunk<HealthAdvice[], void, { rejectValue: string }>(
  'tracking/fetchAdvice',
  async (_, { rejectWithValue }) => {
    try {
      return (await trackingService.advice(5)).data
    } catch (err) {
      return rejectWithValue(msg(err, 'Không tải được đề xuất'))
    }
  },
)

export const analyzeLogs = createAsyncThunk<
  HealthAdvice,
  { days?: number; location?: WeatherLocationQuery },
  { rejectValue: string }
>('tracking/analyze', async (payload, { rejectWithValue }) => {
  try {
    return (await trackingService.analyze(payload)).data
  } catch (err) {
    return rejectWithValue(msg(err, 'Trợ lý AI chưa phân tích được, thử lại sau'))
  }
})

export const toggleSuggestion = createAsyncThunk<
  HealthAdvice,
  { id: string; index: number; done: boolean },
  { rejectValue: string }
>('tracking/toggleSuggestion', async ({ id, index, done }, { rejectWithValue }) => {
  try {
    return (await trackingService.suggestionDone(id, index, done)).data
  } catch (err) {
    return rejectWithValue(msg(err, 'Không cập nhật được đề xuất'))
  }
})

function upsertLogInList(logs: HealthLog[], log: HealthLog) {
  const i = logs.findIndex((l) => l.date === log.date)
  if (i === -1) {
    logs.push(log)
    logs.sort((a, b) => a.date.localeCompare(b.date))
  } else logs[i] = log
}

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    clearTrackingErrors(state) {
      state.saveError = null
      state.analyzeError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)
      .addCase(fetchLogs.pending, (state) => {
        state.logsStatus = 'loading'
        state.logsError = null
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.logsStatus = 'succeeded'
        state.logs = action.payload
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.logsStatus = 'failed'
        state.logsError = action.payload ?? 'Không tải được nhật ký'
      })
      .addCase(saveLog.pending, (state) => {
        state.saving = true
        state.saveError = null
      })
      .addCase(saveLog.fulfilled, (state, action) => {
        state.saving = false
        upsertLogInList(state.logs, action.payload)
      })
      .addCase(saveLog.rejected, (state, action) => {
        state.saving = false
        state.saveError = action.payload ?? 'Lưu nhật ký thất bại'
      })
      .addCase(removeLog.fulfilled, (state, action) => {
        state.logs = state.logs.filter((l) => l.date !== action.payload)
      })
      .addCase(removeLog.rejected, (state, action) => {
        state.saveError = action.payload ?? 'Xóa nhật ký thất bại'
      })
      .addCase(fetchAdvice.pending, (state) => {
        state.adviceStatus = 'loading'
      })
      .addCase(fetchAdvice.fulfilled, (state, action) => {
        state.adviceStatus = 'succeeded'
        state.advice = action.payload
      })
      .addCase(fetchAdvice.rejected, (state) => {
        state.adviceStatus = 'failed'
      })
      .addCase(analyzeLogs.pending, (state) => {
        state.analyzing = true
        state.analyzeError = null
      })
      .addCase(analyzeLogs.fulfilled, (state, action) => {
        state.analyzing = false
        state.advice = [action.payload, ...state.advice].slice(0, 5)
      })
      .addCase(analyzeLogs.rejected, (state, action) => {
        state.analyzing = false
        state.analyzeError = action.payload ?? 'Trợ lý AI chưa phân tích được, thử lại sau'
      })
      .addCase(toggleSuggestion.fulfilled, (state, action) => {
        const i = state.advice.findIndex((a) => a.id === action.payload.id)
        if (i !== -1) state.advice[i] = action.payload
      })
  },
})

export const { clearTrackingErrors } = trackingSlice.actions
export default trackingSlice.reducer
