import { axiosClient, ENDPOINTS } from '@/api'
import type { ApiResponse, MedicalRecord, Medication, RecordType } from '@/types'

export interface ListRecordsParams {
  year?: number
  q?: string
  limit?: number
}

/** Body PUT /records/:id; trường không gửi giữ nguyên, null = xóa */
export interface UpdateRecordPayload {
  type?: RecordType
  facility?: string | null
  doctor?: string | null
  visitDate?: string | null
  diagnosis?: string | null
  medications?: Medication[]
  notes?: string | null
  confirm?: boolean
}

/** OCR bằng LLM vision mất 5–30s */
const OCR_TIMEOUT_MS = 120_000

export const recordService = {
  list: (params: ListRecordsParams = {}) =>
    axiosClient.get<ApiResponse<MedicalRecord[]>, ApiResponse<MedicalRecord[]>>(
      ENDPOINTS.RECORDS.LIST,
      { params },
    ),
  get: (id: string) =>
    axiosClient.get<ApiResponse<MedicalRecord>, ApiResponse<MedicalRecord>>(
      ENDPOINTS.RECORDS.DETAIL(id),
    ),
  /** Nhiều file = nhiều trang của cùng một bộ hồ sơ, AI gộp thành một kết quả */
  upload: (files: File[], type?: RecordType) => {
    const form = new FormData()
    for (const f of files) form.append('images', f)
    if (type) form.append('type', type)
    return axiosClient.post<ApiResponse<MedicalRecord>, ApiResponse<MedicalRecord>>(
      ENDPOINTS.RECORDS.UPLOAD,
      form,
      { timeout: OCR_TIMEOUT_MS },
    )
  },
  update: (id: string, payload: UpdateRecordPayload) =>
    axiosClient.put<ApiResponse<MedicalRecord>, ApiResponse<MedicalRecord>>(
      ENDPOINTS.RECORDS.DETAIL(id),
      payload,
    ),
  reprocess: (id: string) =>
    axiosClient.post<ApiResponse<MedicalRecord>, ApiResponse<MedicalRecord>>(
      ENDPOINTS.RECORDS.REPROCESS(id),
      undefined,
      { timeout: OCR_TIMEOUT_MS },
    ),
  remove: (id: string) =>
    axiosClient.delete<ApiResponse<{ deleted: boolean }>, ApiResponse<{ deleted: boolean }>>(
      ENDPOINTS.RECORDS.DETAIL(id),
    ),
  /** Ảnh gốc cần token nên tải về dạng Blob rồi tạo object URL ở hook */
  image: (id: string, page = 0) =>
    axiosClient.get<Blob, Blob>(ENDPOINTS.RECORDS.IMAGE(id, page), { responseType: 'blob' }),
}
