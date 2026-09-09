import { rateLimit } from 'express-rate-limit'
import { isProd } from '../config/env.js'

const message = { success: false, message: 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút' }

/** Chống dò mật khẩu: 10 lần đăng nhập / 15 phút / IP. Nới lỏng khi dev. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProd ? 10 : 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message,
})

/** Chống spam tạo tài khoản: 5 lần đăng ký / giờ / IP. */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: isProd ? 5 : 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message,
})
