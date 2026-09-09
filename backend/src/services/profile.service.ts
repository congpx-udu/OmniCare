import { HealthProfile } from '../models/HealthProfile.js'
import type { UpdateProfileInput } from '../validators/profile.validator.js'

type Gender = 'male' | 'female' | 'other'

interface ProfileSource {
  heightCm?: number | null
  weightKg?: number | null
  dateOfBirth?: Date | null
  gender?: string | null
  chronicConditions?: string[]
  allergies?: string[]
  updatedAt?: Date
}

/** BMI = kg / m², làm tròn 1 chữ số. Trả null khi thiếu dữ liệu. */
export function calcBmi(heightCm?: number | null, weightKg?: number | null) {
  if (!heightCm || !weightKg) return null
  const m = heightCm / 100
  return Math.round((weightKg / (m * m)) * 10) / 10
}

/** Tuổi tròn theo ngày hiện tại. Trả null khi chưa có ngày sinh. */
export function calcAge(dateOfBirth?: Date | null, now = new Date()) {
  if (!dateOfBirth) return null
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear()
  const beforeBirthday =
    now.getUTCMonth() < dateOfBirth.getUTCMonth() ||
    (now.getUTCMonth() === dateOfBirth.getUTCMonth() && now.getUTCDate() < dateOfBirth.getUTCDate())
  if (beforeBirthday) age -= 1
  return age
}

function toPublicProfile(p: ProfileSource | null) {
  const heightCm = p?.heightCm ?? null
  const weightKg = p?.weightKg ?? null
  const dateOfBirth = p?.dateOfBirth ?? null
  const gender = (p?.gender as Gender | undefined) ?? null
  const chronicConditions = p?.chronicConditions ?? []
  const allergies = p?.allergies ?? []
  const isComplete = heightCm !== null && weightKg !== null && dateOfBirth !== null
  return {
    heightCm,
    weightKg,
    dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().slice(0, 10) : null,
    gender,
    chronicConditions,
    allergies,
    bmi: calcBmi(heightCm, weightKg),
    age: calcAge(dateOfBirth),
    /** Đủ chiều cao, cân nặng, ngày sinh để AI cá nhân hóa */
    isComplete,
    updatedAt: p?.updatedAt ? p.updatedAt.toISOString() : null,
  }
}

export type PublicProfile = ReturnType<typeof toPublicProfile>

/** Hồ sơ của user hiện tại; trả hồ sơ rỗng (chưa lưu) nếu chưa có */
export async function getProfile(userId: string) {
  const profile = await HealthProfile.findOne({ user: userId }).lean()
  return toPublicProfile(profile)
}

/** Upsert theo userId. Chỉ ghi các trường có trong input; null = xóa giá trị. */
export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue
    if (value === null) $unset[key] = 1
    else $set[key] = value
  }
  const update: Record<string, unknown> = {}
  if (Object.keys($set).length) update.$set = $set
  if (Object.keys($unset).length) update.$unset = $unset
  const profile = await HealthProfile.findOneAndUpdate({ user: userId }, update, {
    returnDocument: 'after',
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true,
  }).lean()
  return toPublicProfile(profile)
}
