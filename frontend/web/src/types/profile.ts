export type Gender = 'male' | 'female' | 'other'

/**
 * Hồ sơ cá nhân trả về từ GET/PUT /profile: thông tin tài khoản + thể trạng nền,
 * kèm cân nặng mới nhất từ nhật ký theo dõi và bmi/age tính sẵn.
 */
export interface HealthProfile {
  fullName: string
  email: string | null
  phone: string
  heightCm: number | null
  /** Cân nặng mới nhất trong nhật ký theo dõi (không nhập ở hồ sơ) */
  weightKg: number | null
  /** yyyy-mm-dd của lần ghi cân nặng; null nếu chưa ghi nhật ký */
  weightDate: string | null
  /** yyyy-mm-dd */
  dateOfBirth: string | null
  gender: Gender | null
  chronicConditions: string[]
  allergies: string[]
  bmi: number | null
  age: number | null
  /** Đủ chiều cao và ngày sinh */
  isComplete: boolean
  updatedAt: string | null
}
