import { z } from 'zod'

/** Ô số để trống → null, còn lại parse số (chấp nhận dấu phẩy thập phân) */
const optionalNumber = (min: number, max: number, unit: string) =>
  z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : Number(v.replace(',', '.'))))
    .pipe(
      z
        .number({ error: 'Vui lòng nhập số' })
        .min(min, `Tối thiểu ${min} ${unit}`)
        .max(max, `Tối đa ${max} ${unit}`)
        .nullable(),
    )

const today = () => new Date().toISOString().slice(0, 10)

export const profileFormSchema = z.object({
  heightCm: optionalNumber(30, 250, 'cm'),
  weightKg: optionalNumber(2, 500, 'kg'),
  dateOfBirth: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .pipe(
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh không hợp lệ')
        .refine((d) => d <= today(), 'Ngày sinh không được ở tương lai')
        .nullable(),
    ),
  gender: z.enum(['male', 'female', 'other']).nullable(),
  chronicConditions: z
    .array(z.string().trim().min(1).max(60, 'Mỗi mục tối đa 60 ký tự'))
    .max(30, 'Tối đa 30 mục'),
  allergies: z
    .array(z.string().trim().min(1).max(60, 'Mỗi mục tối đa 60 ký tự'))
    .max(30, 'Tối đa 30 mục'),
})

export type ProfileForm = z.infer<typeof profileFormSchema>
