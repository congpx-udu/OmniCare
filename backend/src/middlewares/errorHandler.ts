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
  // Body JSON hỏng (body-parser) → 400 thay vì 500
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'JSON không hợp lệ' })
  }
  // Body quá lớn
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Dữ liệu gửi lên quá lớn' })
  }
  // multer: quá kích thước / quá số file / sai tên trường
  if (err?.name === 'MulterError') {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: 'Ảnh vượt quá 10MB',
      LIMIT_FILE_COUNT: 'Quá nhiều ảnh trong một lần tải',
      // multer báo UNEXPECTED_FILE khi vượt số file của .array(field, max) hoặc sai tên trường
      LIMIT_UNEXPECTED_FILE: 'Quá nhiều ảnh (tối đa 8) hoặc sai tên trường file ("images")',
    }
    return res
      .status(400)
      .json({ success: false, message: messages[err.code] ?? 'Tải file thất bại' })
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
