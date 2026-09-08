import type { RequestHandler } from 'express'
import { ApiError } from '../utils/ApiError.js'
import { verifyToken } from '../utils/jwt.js'

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return next(ApiError.unauthorized())
  try {
    const payload = verifyToken(header.slice(7))
    req.userId = payload.sub
    next()
  } catch {
    next(ApiError.unauthorized('Token không hợp lệ hoặc đã hết hạn'))
  }
}
