import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '@/constants'
import { authService, type LoginPayload, type RegisterPayload } from '@/services/authService'
import type { User } from '@/types'
import { getApiErrorMessage } from '@/utils/apiError'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

interface AuthState {
  token: string | null
  user: User | null
  /** Trạng thái xác thực phiên khi tải trang (gọi /auth/me) */
  status: Status
  error: string | null
}

function readToken() {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  } catch {
    return null
  }
}

const initialState: AuthState = {
  token: readToken(),
  user: null,
  status: 'idle',
  error: null,
}

export const login = createAsyncThunk<
  { token: string; user: User },
  LoginPayload,
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const res = await authService.login(payload)
    return res.data
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Đăng nhập thất bại'))
  }
})

export const register = createAsyncThunk<User, RegisterPayload, { rejectValue: string }>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authService.register(payload)
      return res.data.user
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Đăng ký thất bại'))
    }
  },
)

export const fetchMe = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.me()
      return res.data
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Phiên đăng nhập không hợp lệ'))
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null
      state.user = null
      state.status = 'idle'
      state.error = null
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.token
        state.user = action.payload.user
        localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload.token)
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Đăng nhập thất bại'
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        // Không đăng nhập tự động: người dùng quay về trang đăng nhập
        state.status = 'idle'
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Đăng ký thất bại'
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
      })
      .addCase(fetchMe.rejected, (state) => {
        state.status = 'failed'
        state.token = null
        state.user = null
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
