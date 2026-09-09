import { Schema, model, type InferSchemaType } from 'mongoose'

export const ACTIVITY_TYPES = [
  'walking',
  'running',
  'cycling',
  'gym',
  'yoga',
  'swimming',
  'sports',
  'housework',
  'other',
] as const
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

/** Nhật ký sức khỏe mỗi ngày một bản ghi (chỉ số + hoạt động), người dùng tự nhập */
const healthLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Ngày địa phương, lưu 00:00 UTC của yyyy-mm-dd
    date: { type: Date, required: true },
    weightKg: { type: Number, min: 2, max: 500 },
    systolic: { type: Number, min: 50, max: 300 },
    diastolic: { type: Number, min: 30, max: 200 },
    heartRate: { type: Number, min: 20, max: 250 },
    glucose: { type: Number, min: 1, max: 40 },
    sleepHours: { type: Number, min: 0, max: 24 },
    activityMinutes: { type: Number, min: 0, max: 1440 },
    activityType: { type: String, enum: ACTIVITY_TYPES },
    // Cảm nhận 1 (rất tệ) → 5 (rất tốt)
    mood: { type: Number, min: 1, max: 5 },
    note: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
)

healthLogSchema.index({ user: 1, date: -1 }, { unique: true })

export type HealthLogDoc = InferSchemaType<typeof healthLogSchema>
export const HealthLog = model('HealthLog', healthLogSchema)
