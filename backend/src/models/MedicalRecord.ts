import { Schema, model, type InferSchemaType } from 'mongoose'

export const RECORD_TYPES = ['prescription', 'medical_record', 'lab_result', 'other'] as const
export type RecordType = (typeof RECORD_TYPES)[number]

/** pending: đang OCR · needs_review: AI bóc tách xong, chờ người dùng xác nhận · done: đã xác nhận · failed: OCR lỗi */
export const RECORD_STATUSES = ['pending', 'needs_review', 'done', 'failed'] as const
export type RecordStatus = (typeof RECORD_STATUSES)[number]

const medicationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    dose: { type: String, trim: true },
    frequency: { type: String, trim: true },
    quantity: { type: String, trim: true },
    duration: { type: String, trim: true },
    instructions: { type: String, trim: true },
  },
  { _id: false },
)

const pageSchema = new Schema(
  {
    path: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false },
)

const medicalRecordSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: RECORD_TYPES, default: 'other' },
    status: { type: String, enum: RECORD_STATUSES, default: 'pending', index: true },
    // Ảnh gốc: đường dẫn trong thư mục uploads/, chỉ phục vụ qua GET /records/:id/image (có auth)
    // Các trang ảnh của cùng một bộ hồ sơ, theo thứ tự upload
    pages: { type: [pageSchema], required: true },
    // Dữ liệu bóc tách, người dùng có thể sửa tay
    facility: { type: String, trim: true },
    doctor: { type: String, trim: true },
    visitDate: Date,
    diagnosis: { type: String, trim: true },
    medications: { type: [medicationSchema], default: [] },
    // Bảng thuốc đúng theo cột của tài liệu (hiển thị); medications là bản chuẩn hóa (chat, đếm)
    medicationTable: {
      columns: { type: [{ key: String, label: String, _id: false }], default: [] },
      rows: { type: [Schema.Types.Mixed], default: [] },
    },
    notes: { type: String, trim: true },
    rawText: String,
    confidence: Number,
    warnings: { type: [String], default: [] },
    errorMessage: String,
    ocrModel: String,
  },
  { timestamps: true },
)

medicalRecordSchema.index({ user: 1, visitDate: -1, createdAt: -1 })

export type MedicalRecordDoc = InferSchemaType<typeof medicalRecordSchema>
export const MedicalRecord = model('MedicalRecord', medicalRecordSchema)
