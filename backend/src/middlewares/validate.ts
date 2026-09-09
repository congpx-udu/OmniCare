import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'
import { ApiError } from '../utils/ApiError.js'

/**
 * Validate { body, params, query } bằng Zod, gán lại giá trị đã parse.
 * Express 5 không cho gán lại req.query nên query đã parse (đã coerce kiểu) nằm ở res.locals.query.
 */
export const validate =
  (schema: ZodType): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query })
    if (!result.success) {
      return next(ApiError.badRequest('Dữ liệu không hợp lệ', result.error.issues))
    }
    const data = result.data as { body?: unknown; query?: unknown; params?: unknown }
    if (data.body !== undefined) req.body = data.body
    if (data.query !== undefined) res.locals.query = data.query
    if (data.params !== undefined) res.locals.params = data.params
    next()
  }
