/** Hồ sơ sức khỏe trả về từ GET/PUT /profile (đã kèm bmi/age tính sẵn) */
export interface HealthProfile {
  heightCm: number | null
  weightKg: number | null
  /** yyyy-mm-dd */
  dateOfBirth: string | null
  chronicConditions: string[]
  allergies: string[]
  bmi: number | null
  age: number | null
  /** Đủ chiều cao, cân nặng, ngày sinh */
  isComplete: boolean
  updatedAt: string | null
}
