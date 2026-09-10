import { HealthLog } from '../models/HealthLog.js'
import { HealthProfile } from '../models/HealthProfile.js'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import type { UpdateProfileInput } from '../validators/profile.validator.js'

type Gender = 'male' | 'female' | 'other'

interface ProfileSource {
  heightCm?: number | null
  /** Trường cũ: trước đây nhập tay trong hồ sơ; nay chỉ dùng dự phòng khi nhật ký chưa có cân nặng */
  weightKg?: number | null
  dateOfBirth?: Date | null
  gender?: string | null
  chronicConditions?: string[]
  allergies?: string[]
  updatedAt?: Date
}

interface AccountSource {
  phone: string
  email?: string | null
  fullName: string
}

/** Cân nặng mới nhất trong nhật ký theo dõi sức khỏe (Giai đoạn 5) */
interface LatestWeight {
  weightKg: number
  /** yyyy-mm-dd */
  date: string
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

function toPublicProfile(
  p: ProfileSource | null,
  account: AccountSource | null,
  latestWeight: LatestWeight | null,
) {
  const heightCm = p?.heightCm ?? null
  // Ưu tiên cân nặng từ nhật ký (cập nhật theo ngày); dự phòng giá trị cũ trong hồ sơ
  const weightKg = latestWeight?.weightKg ?? p?.weightKg ?? null
  const weightDate = latestWeight?.date ?? null
  const dateOfBirth = p?.dateOfBirth ?? null
  const gender = (p?.gender as Gender | undefined) ?? null
  const chronicConditions = p?.chronicConditions ?? []
  const allergies = p?.allergies ?? []
  const isComplete = heightCm !== null && dateOfBirth !== null
  return {
    fullName: account?.fullName ?? '',
    email: account?.email ?? null,
    phone: account?.phone ?? '',
    heightCm,
    weightKg,
    /** Ngày ghi cân nặng trong nhật ký; null nếu lấy từ hồ sơ cũ hoặc chưa có */
    weightDate,
    dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().slice(0, 10) : null,
    gender,
    chronicConditions,
    allergies,
    bmi: calcBmi(heightCm, weightKg),
    age: calcAge(dateOfBirth),
    /** Đủ chiều cao và ngày sinh để AI cá nhân hóa (cân nặng lấy từ nhật ký) */
    isComplete,
    updatedAt: p?.updatedAt ? p.updatedAt.toISOString() : null,
  }
}

export type PublicProfile = ReturnType<typeof toPublicProfile>

async function loadLatestWeight(userId: string): Promise<LatestWeight | null> {
  const log = await HealthLog.findOne({ user: userId, weightKg: { $ne: null } })
    .sort({ date: -1 })
    .select('date weightKg')
    .lean()
  if (!log || log.weightKg === null || log.weightKg === undefined) return null
  return { weightKg: log.weightKg, date: log.date.toISOString().slice(0, 10) }
}

async function loadAccount(userId: string): Promise<AccountSource | null> {
  return User.findById(userId).select('phone email fullName').lean()
}

/** Hồ sơ của user hiện tại; trả hồ sơ rỗng (chưa lưu) nếu chưa có */
export async function getProfile(userId: string) {
  const [profile, account, latestWeight] = await Promise.all([
    HealthProfile.findOne({ user: userId }).lean(),
    loadAccount(userId),
    loadLatestWeight(userId),
  ])
  return toPublicProfile(profile, account, latestWeight)
}

/**
 * Upsert theo userId. Chỉ ghi các trường có trong input; null = xóa giá trị.
 * fullName/email thuộc tài khoản (User), các trường còn lại thuộc HealthProfile.
 */
export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const { fullName, email, ...health } = input

  if (fullName !== undefined || email !== undefined) {
    const accountUpdate: Record<string, unknown> = {}
    if (fullName !== undefined) accountUpdate.fullName = fullName
    if (email !== undefined) {
      if (email === null) accountUpdate.$unset = { email: 1 }
      else {
        const taken = await User.exists({ email, _id: { $ne: userId } })
        if (taken) throw ApiError.conflict('Email đã được đăng ký')
        accountUpdate.email = email
      }
    }
    const { $unset, ...set } = accountUpdate
    const update: Record<string, unknown> = {}
    if (Object.keys(set).length) update.$set = set
    if ($unset) update.$unset = $unset
    await User.updateOne({ _id: userId }, update, { runValidators: true })
  }

  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}
  for (const [key, value] of Object.entries(health)) {
    if (value === undefined) continue
    if (value === null) $unset[key] = 1
    else $set[key] = value
  }
  const update: Record<string, unknown> = {}
  if (Object.keys($set).length) update.$set = $set
  if (Object.keys($unset).length) update.$unset = $unset
  const [profile, account, latestWeight] = await Promise.all([
    HealthProfile.findOneAndUpdate({ user: userId }, update, {
      returnDocument: 'after',
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }).lean(),
    loadAccount(userId),
    loadLatestWeight(userId),
  ])
  return toPublicProfile(profile, account, latestWeight)
}
