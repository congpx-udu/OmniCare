export type RecordType = 'prescription' | 'medical_record' | 'lab_result' | 'other'
/** pending: đang OCR · needs_review: chờ xác nhận · done: đã xác nhận · failed: OCR lỗi */
export type RecordStatus = 'pending' | 'needs_review' | 'done' | 'failed'

export interface Medication {
  name: string
  dose: string | null
  frequency: string | null
  duration: string | null
  instructions: string | null
}

/** Hồ sơ bệnh án / đơn thuốc từ GET /records */
export interface MedicalRecord {
  id: string
  type: RecordType
  status: RecordStatus
  facility: string | null
  doctor: string | null
  /** yyyy-mm-dd */
  visitDate: string | null
  diagnosis: string | null
  medications: Medication[]
  notes: string | null
  rawText: string | null
  confidence: number | null
  warnings: string[]
  errorMessage: string | null
  imageMime: string
  imageSize: number
  createdAt: string
  updatedAt: string
}
