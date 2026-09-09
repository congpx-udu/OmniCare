import { z } from 'zod'

const MAX_TAGS = 30
const MAX_TAG_LEN = 60

/** Danh sách tag (bệnh nền, dị ứng): cắt khoảng trắng, bỏ rỗng, loại trùng (không phân biệt hoa thường) */
const tagListSchema = z
  .array(z.string().trim().min(1).max(MAX_TAG_LEN, `Mỗi mục tối đa ${MAX_TAG_LEN} ký tự`))
  .max(MAX_TAGS, `Tối đa ${MAX_TAGS} mục`)
  .transform((list) => {
    const seen = new Set<string>()
    return list.filter((t) => {
      const key = t.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  })

/** Ngày sinh: ISO yyyy-mm-dd, không ở tương lai, tuổi ≤ 120 */
const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh không hợp lệ')
  .transform((s) => new Date(`${s}T00:00:00.000Z`))
  .refine((d) => !Number.isNaN(d.getTime()), 'Ngày sinh không hợp lệ')
  .refine((d) => d.getTime() <= Date.now(), 'Ngày sinh không được ở tương lai')
  .refine(
    (d) => Date.now() - d.getTime() < 120 * 365.25 * 24 * 3600 * 1000,
    'Ngày sinh không hợp lệ',
  )

export const updateProfileSchema = z.object({
  body: z.object({
    heightCm: z
      .number()
      .min(30, 'Chiều cao tối thiểu 30 cm')
      .max(250, 'Chiều cao tối đa 250 cm')
      .nullable()
      .optional(),
    weightKg: z
      .number()
      .min(2, 'Cân nặng tối thiểu 2 kg')
      .max(500, 'Cân nặng tối đa 500 kg')
      .nullable()
      .optional(),
    dateOfBirth: dateOfBirthSchema.nullable().optional(),
    gender: z
      .enum(['male', 'female', 'other'], { error: 'Giới tính không hợp lệ' })
      .nullable()
      .optional(),
    chronicConditions: tagListSchema.optional(),
    allergies: tagListSchema.optional(),
  }),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body']
