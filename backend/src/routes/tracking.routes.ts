import { Router } from 'express'
import * as ctrl from '../controllers/tracking.controller.js'
import { requireAuth } from '../middlewares/auth.js'
import { chatLimiter } from '../middlewares/rateLimit.js'
import { validate } from '../middlewares/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  analyzeSchema,
  listAdviceSchema,
  listLogsSchema,
  logDateSchema,
  suggestionDoneSchema,
  upsertLogSchema,
} from '../validators/tracking.validator.js'

export const trackingRouter = Router()

trackingRouter.use(requireAuth)
trackingRouter.get('/logs', validate(listLogsSchema), asyncHandler(ctrl.listLogs))
trackingRouter.put('/logs/:date', validate(upsertLogSchema), asyncHandler(ctrl.upsertLog))
trackingRouter.delete('/logs/:date', validate(logDateSchema), asyncHandler(ctrl.deleteLog))
trackingRouter.post('/analyze', chatLimiter, validate(analyzeSchema), asyncHandler(ctrl.analyze))
trackingRouter.get('/advice', validate(listAdviceSchema), asyncHandler(ctrl.listAdvice))
trackingRouter.patch(
  '/advice/:id/suggestions/:index',
  validate(suggestionDoneSchema),
  asyncHandler(ctrl.suggestionDone),
)
