import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { logout } from '@/redux/slices/authSlice'
import { profileService, type UpdateProfilePayload } from '@/services/profileService'
import type { HealthProfile } from '@/types'
import { getApiErrorMessage } from '@/utils/apiError'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

interface ProfileState {
  profile: HealthProfile | null
  /** Trạng thái tải hồ sơ */
  status: Status
  /** Trạng thái lưu hồ sơ */
  saveStatus: Status
  error: string | null
}

const initialState: ProfileState = {
  profile: null,
  status: 'idle',
  saveStatus: 'idle',
  error: null,
}

export const fetchProfile = createAsyncThunk<HealthProfile, void, { rejectValue: string }>(
  'profile/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await profileService.get()
      return res.data
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Không tải được hồ sơ cá nhân'))
    }
  },
)

export const saveProfile = createAsyncThunk<
  HealthProfile,
  UpdateProfilePayload,
  { rejectValue: string }
>('profile/save', async (payload, { rejectWithValue }) => {
  try {
    const res = await profileService.update(payload)
    return res.data
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Lưu hồ sơ thất bại'))
  }
})

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: () => initialState,
    resetSaveStatus(state) {
      state.saveStatus = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Đăng xuất thì bỏ dữ liệu sức khỏe khỏi bộ nhớ
      .addCase(logout, () => initialState)
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.profile = action.payload
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Không tải được hồ sơ cá nhân'
      })
      .addCase(saveProfile.pending, (state) => {
        state.saveStatus = 'loading'
        state.error = null
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.profile = action.payload
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.error = action.payload ?? 'Lưu hồ sơ thất bại'
      })
  },
})

export const { clearProfile, resetSaveStatus } = profileSlice.actions
export default profileSlice.reducer
