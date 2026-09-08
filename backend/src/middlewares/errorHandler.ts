import type { ErrorRequestHandler, RequestHandler } from 'express'
import { isProd } from '../config/env.js'
import { logger } from '../config/logger.js'
import { ApiError } from '../utils/ApiError.js'

export const notFound: RequestHandler = (_req, _res, next) => {
  next(ApiError.notFound('Không tìm thấy route'))
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message, details: err.details })
  }
  // Mongo duplicate key
  if (err?.code === 11000) {
    return res.status(409).json({ success: false, message: 'Dữ liệu đã tồn tại' })
  }
  logger.error(err)
  res.status(500).json({
    success: false,
    message: 'Lỗi máy chủ',
    ...(isProd ? {} : { stack: err?.stack }),
  })
}
