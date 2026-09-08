import { Schema, model } from 'mongoose'

const medicalRecordSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['prescription', 'medical_record'], required: true },
    imagePath: { type: String, required: true },
    status: { type: String, enum: ['pending', 'done', 'failed'], default: 'pending' },
    rawText: String,
    // Dữ liệu có cấu trúc do OCR + AI bóc tách (tên thuốc, chẩn đoán, ngày khám...)
    extracted: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

export const MedicalRecord = model('MedicalRecord', medicalRecordSchema)
