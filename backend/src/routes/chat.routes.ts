import { Router } from 'express'
import * as ctrl from '../controllers/chat.controller.js'
import { requireAuth } from '../middlewares/auth.js'
import { chatLimiter } from '../middlewares/rateLimit.js'
import { validate } from '../middlewares/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  chatHistorySchema,
  clearHistorySchema,
  sendChatSchema,
} from '../validators/chat.validator.js'

export const chatRouter = Router()

chatRouter.use(requireAuth)
chatRouter.post('/', chatLimiter, validate(sendChatSchema), asyncHandler(ctrl.send))
chatRouter.get('/history', validate(chatHistorySchema), asyncHandler(ctrl.history))
chatRouter.delete('/history', validate(clearHistorySchema), asyncHandler(ctrl.clear))
