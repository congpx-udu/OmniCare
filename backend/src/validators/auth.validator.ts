import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    fullName: z.string().min(2).max(100),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
})

export type RegisterInput = z.infer<typeof registerSchema>['body']
export type LoginInput = z.infer<typeof loginSchema>['body']
