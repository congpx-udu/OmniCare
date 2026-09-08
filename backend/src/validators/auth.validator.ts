import { z } from 'zod'

/** Số điện thoại Việt Nam: 0xxxxxxxxx hoặc +84xxxxxxxxx, chuẩn hóa về 0xxxxxxxxx */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s.-]/g, '').replace(/^\+?84/, '0'))
  .pipe(z.string().regex(/^0(3|5|7|8|9)\d{8}$/, 'Số điện thoại không hợp lệ'))

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
    phone: phoneSchema,
    email: z.email('Email không hợp lệ').optional(),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(72),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    phone: phoneSchema,
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  }),
})

export type RegisterInput = z.infer<typeof registerSchema>['body']
export type LoginInput = z.infer<typeof loginSchema>['body']
