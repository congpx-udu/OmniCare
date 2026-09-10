import { z } from 'zod'

/** Số điện thoại Việt Nam, chấp nhận 0xxxxxxxxx hoặc +84xxxxxxxxx (giống backend) */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Vui lòng nhập số điện thoại')
  .transform((v) => v.replace(/[\s.-]/g, '').replace(/^\+?84/, '0'))
  .pipe(z.string().regex(/^0(3|5|7|8|9)\d{8}$/, 'Số điện thoại không hợp lệ'))

export const loginFormSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

export const registerFormSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Họ tên tối thiểu 2 ký tự').max(100, 'Họ tên quá dài'),
    phone: phoneSchema,
    email: z
      .string()
      .trim()
      .transform((v) => (v ? v : undefined))
      .pipe(z.email('Email không hợp lệ').optional()),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(72, 'Mật khẩu quá dài'),
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại không khớp',
  })

export type LoginForm = z.infer<typeof loginFormSchema>
export type RegisterForm = z.infer<typeof registerFormSchema>

/** Chuyển Zod issues thành map { field: message } cho form */
export function issuesToFieldErrors(issues: z.core.$ZodIssue[]) {
  const errors: Record<string, string> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? '')
    if (key && !errors[key]) errors[key] = issue.message
  }
  return errors
}
