import { Schema, model, type InferSchemaType } from 'mongoose'

const suggestionSchema = new Schema(
  {
    title: { type: String, required: true },
    detail: { type: String, required: true },
    category: {
      type: String,
      enum: ['activity', 'sleep', 'diet', 'checkup', 'other'],
      default: 'other',
    },
    when: String,
    done: { type: Boolean, default: false },
  },
  { _id: false },
)

/** Kết quả AI phân tích nhật ký sức khỏe, lưu theo lần phân tích để người dùng xem lại và đánh dấu đã làm */
const healthAdviceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    logCount: { type: Number, required: true },
    summary: { type: String, required: true },
    trends: {
      type: [
        {
          metric: String,
          direction: { type: String, enum: ['up', 'down', 'stable'] },
          comment: String,
          _id: false,
        },
      ],
      default: [],
    },
    alerts: {
      type: [
        {
          level: { type: String, enum: ['info', 'warning', 'urgent'] },
          message: String,
          _id: false,
        },
      ],
      default: [],
    },
    suggestions: { type: [suggestionSchema], default: [] },
    model: String,
  },
  { timestamps: true },
)

healthAdviceSchema.index({ user: 1, createdAt: -1 })

export type HealthAdviceDoc = InferSchemaType<typeof healthAdviceSchema>
export const HealthAdvice = model('HealthAdvice', healthAdviceSchema)
