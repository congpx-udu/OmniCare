import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'
import { ApiError } from '../utils/ApiError.js'

/** Validate { body, params, query } bằng Zod, gán lại giá trị đã parse */
export const validate =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query })
    if (!result.success) {
      return next(ApiError.badRequest('Dữ liệu không hợp lệ', result.error.issues))
    }
    const data = result.data as { body?: unknown }
    if (data.body !== undefined) req.body = data.body
    next()
  }
