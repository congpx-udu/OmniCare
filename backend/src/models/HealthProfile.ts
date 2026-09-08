import { Schema, model } from 'mongoose'

const healthProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    heightCm: Number,
    weightKg: Number,
    dateOfBirth: Date,
    chronicConditions: [String],
    allergies: [String],
  },
  { timestamps: true },
)

export const HealthProfile = model('HealthProfile', healthProfileSchema)
