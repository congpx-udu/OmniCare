import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '@/constants'
import type { User } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
}

const initialState: AuthState = {
  token: localStorage.getItem(STORAGE_KEYS.TOKEN),
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token
      state.user = action.payload.user
      localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload.token)
    },
    logout(state) {
      state.token = null
      state.user = null
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
