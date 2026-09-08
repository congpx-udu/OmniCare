import multer from 'multer'
import path from 'node:path'
import { ApiError } from '../utils/ApiError.js'

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
  },
})

export const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) return cb(null, true)
    cb(ApiError.badRequest('Chỉ chấp nhận ảnh JPEG, PNG, WEBP'))
  },
})
