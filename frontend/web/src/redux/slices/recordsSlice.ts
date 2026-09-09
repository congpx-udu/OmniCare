import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { logout } from '@/redux/slices/authSlice'
import {
  recordService,
  type ListRecordsParams,
  type UpdateRecordPayload,
} from '@/services/recordService'
import type { MedicalRecord, RecordType } from '@/types'
import { getApiErrorMessage } from '@/utils/apiError'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

interface RecordsState {
  items: MedicalRecord[]
  listStatus: Status
  listError: string | null
  current: MedicalRecord | null
  currentStatus: Status
  currentError: string | null
  uploading: boolean
  uploadError: string | null
  saving: boolean
  saveError: string | null
}

const initialState: RecordsState = {
  items: [],
  listStatus: 'idle',
  listError: null,
  current: null,
  currentStatus: 'idle',
  currentError: null,
  uploading: false,
  uploadError: null,
  saving: false,
  saveError: null,
}

const reject = (err: unknown, fallback: string) => getApiErrorMessage(err, fallback)

export const fetchRecords = createAsyncThunk<
  MedicalRecord[],
  ListRecordsParams | undefined,
  { rejectValue: string }
>('records/fetchList', async (params, { rejectWithValue }) => {
  try {
    return (await recordService.list(params)).data
  } catch (err) {
    return rejectWithValue(reject(err, 'Không tải được danh sách hồ sơ'))
  }
})

export const fetchRecord = createAsyncThunk<MedicalRecord, string, { rejectValue: string }>(
  'records/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return (await recordService.get(id)).data
    } catch (err) {
      return rejectWithValue(reject(err, 'Không tải được hồ sơ'))
    }
  },
)

export const uploadRecord = createAsyncThunk<
  MedicalRecord,
  { file: File; type?: RecordType },
  { rejectValue: string }
>('records/upload', async ({ file, type }, { rejectWithValue }) => {
  try {
    return (await recordService.upload(file, type)).data
  } catch (err) {
    return rejectWithValue(reject(err, 'Tải ảnh thất bại'))
  }
})

export const updateRecord = createAsyncThunk<
  MedicalRecord,
  { id: string; payload: UpdateRecordPayload },
  { rejectValue: string }
>('records/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return (await recordService.update(id, payload)).data
  } catch (err) {
    return rejectWithValue(reject(err, 'Lưu hồ sơ thất bại'))
  }
})

export const reprocessRecord = createAsyncThunk<MedicalRecord, string, { rejectValue: string }>(
  'records/reprocess',
  async (id, { rejectWithValue }) => {
    try {
      return (await recordService.reprocess(id)).data
    } catch (err) {
      return rejectWithValue(reject(err, 'Đọc lại thất bại'))
    }
  },
)

export const deleteRecord = createAsyncThunk<string, string, { rejectValue: string }>(
  'records/delete',
  async (id, { rejectWithValue }) => {
    try {
      await recordService.remove(id)
      return id
    } catch (err) {
      return rejectWithValue(reject(err, 'Xóa hồ sơ thất bại'))
    }
  },
)

function upsert(items: MedicalRecord[], record: MedicalRecord) {
  const i = items.findIndex((r) => r.id === record.id)
  if (i === -1) items.unshift(record)
  else items[i] = record
}

const recordsSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    clearRecordErrors(state) {
      state.uploadError = null
      state.saveError = null
      state.currentError = null
    },
    clearCurrentRecord(state) {
      state.current = null
      state.currentStatus = 'idle'
      state.currentError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)
      .addCase(fetchRecords.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = null
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.payload ?? 'Không tải được danh sách hồ sơ'
      })
      .addCase(fetchRecord.pending, (state) => {
        state.currentStatus = 'loading'
        state.currentError = null
      })
      .addCase(fetchRecord.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded'
        state.current = action.payload
        upsert(state.items, action.payload)
      })
      .addCase(fetchRecord.rejected, (state, action) => {
        state.currentStatus = 'failed'
        state.currentError = action.payload ?? 'Không tải được hồ sơ'
      })
      .addCase(uploadRecord.pending, (state) => {
        state.uploading = true
        state.uploadError = null
      })
      .addCase(uploadRecord.fulfilled, (state, action) => {
        state.uploading = false
        upsert(state.items, action.payload)
        state.current = action.payload
        state.currentStatus = 'succeeded'
      })
      .addCase(uploadRecord.rejected, (state, action) => {
        state.uploading = false
        state.uploadError = action.payload ?? 'Tải ảnh thất bại'
      })
      .addCase(updateRecord.pending, (state) => {
        state.saving = true
        state.saveError = null
      })
      .addCase(updateRecord.fulfilled, (state, action) => {
        state.saving = false
        state.current = action.payload
        upsert(state.items, action.payload)
      })
      .addCase(updateRecord.rejected, (state, action) => {
        state.saving = false
        state.saveError = action.payload ?? 'Lưu hồ sơ thất bại'
      })
      .addCase(reprocessRecord.pending, (state) => {
        state.saving = true
        state.saveError = null
      })
      .addCase(reprocessRecord.fulfilled, (state, action) => {
        state.saving = false
        state.current = action.payload
        upsert(state.items, action.payload)
      })
      .addCase(reprocessRecord.rejected, (state, action) => {
        state.saving = false
        state.saveError = action.payload ?? 'Đọc lại thất bại'
      })
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload)
        if (state.current?.id === action.payload) state.current = null
      })
      .addCase(deleteRecord.rejected, (state, action) => {
        state.saveError = action.payload ?? 'Xóa hồ sơ thất bại'
      })
  },
})

export const { clearRecordErrors, clearCurrentRecord } = recordsSlice.actions
export default recordsSlice.reducer
