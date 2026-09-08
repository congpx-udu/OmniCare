import type { NextFunction, Request, RequestHandler, Response } from 'express'

/** Bọc controller async để lỗi tự chuyển tới errorHandler (Express 5 đã hỗ trợ, giữ để tường minh) */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next)
  }
