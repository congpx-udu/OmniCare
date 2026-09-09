import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '@/constants'
import { logout } from '@/redux/slices/authSlice'
import { contextService } from '@/services/contextService'
import type { WeatherInsight, WeatherLocationQuery, WeatherSnapshot } from '@/types'
import { getApiErrorMessage } from '@/utils/apiError'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

interface WeatherState {
  data: WeatherSnapshot | null
  /** Vị trí đang dùng, nhớ trong phiên để các trang khác (dashboard, chat) dùng lại */
  query: WeatherLocationQuery | null
  status: Status
  error: string | null
  /** Khối "ảnh hưởng đến bạn" (AI), tải sau khi có thời tiết */
  insight: WeatherInsight | null
  insightStatus: Status
  insightError: string | null
}

function readQuery(): WeatherLocationQuery | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.WEATHER_QUERY)
    return raw ? (JSON.parse(raw) as WeatherLocationQuery) : null
  } catch {
    return null
  }
}

function writeQuery(query: WeatherLocationQuery | null) {
  try {
    if (query) sessionStorage.setItem(STORAGE_KEYS.WEATHER_QUERY, JSON.stringify(query))
    else sessionStorage.removeItem(STORAGE_KEYS.WEATHER_QUERY)
  } catch {
    // sessionStorage có thể bị chặn; bỏ qua, chỉ mất tính năng nhớ vị trí
  }
}

const initialState: WeatherState = {
  data: null,
  query: readQuery(),
  status: 'idle',
  error: null,
  insight: null,
  insightStatus: 'idle',
  insightError: null,
}

export const fetchWeather = createAsyncThunk<
  { data: WeatherSnapshot; query: WeatherLocationQuery },
  WeatherLocationQuery,
  { rejectValue: string }
>('weather/fetch', async (query, { rejectWithValue }) => {
  try {
    const res = await contextService.weather(query)
    return { data: res.data, query }
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Không lấy được dữ liệu thời tiết'))
  }
})

export const fetchWeatherInsight = createAsyncThunk<
  WeatherInsight,
  WeatherLocationQuery,
  { rejectValue: string }
>('weather/fetchInsight', async (query, { rejectWithValue }) => {
  try {
    const res = await contextService.weatherInsight(query)
    return res.data
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Không lấy được lưu ý từ trợ lý AI'))
  }
})

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    clearWeatherError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => {
        writeQuery(null)
        return { ...initialState, query: null }
      })
      .addCase(fetchWeather.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload.data
        state.query = action.payload.query
        writeQuery(action.payload.query)
        // Đổi vị trí thì lưu ý cũ không còn đúng
        state.insight = null
        state.insightStatus = 'idle'
        state.insightError = null
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Không lấy được dữ liệu thời tiết'
      })
      .addCase(fetchWeatherInsight.pending, (state) => {
        state.insightStatus = 'loading'
        state.insightError = null
      })
      .addCase(fetchWeatherInsight.fulfilled, (state, action) => {
        state.insightStatus = 'succeeded'
        state.insight = action.payload
      })
      .addCase(fetchWeatherInsight.rejected, (state, action) => {
        state.insightStatus = 'failed'
        state.insightError = action.payload ?? 'Không lấy được lưu ý từ trợ lý AI'
      })
  },
})

export const { clearWeatherError } = weatherSlice.actions
export default weatherSlice.reducer
