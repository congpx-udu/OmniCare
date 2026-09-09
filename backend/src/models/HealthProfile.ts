import { Schema, model, type InferSchemaType } from 'mongoose'

const healthProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    heightCm: { type: Number, min: 30, max: 250 },
    weightKg: { type: Number, min: 2, max: 500 },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    chronicConditions: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
  },
  { timestamps: true },
)

export type HealthProfileDoc = InferSchemaType<typeof healthProfileSchema>
export const HealthProfile = model('HealthProfile', healthProfileSchema)
