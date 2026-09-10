import { Router } from 'express'
import * as ctrl from '../controllers/chat.controller.js'
import { requireAuth } from '../middlewares/auth.js'
import { chatLimiter } from '../middlewares/rateLimit.js'
import { uploadImage } from '../middlewares/upload.js'
import { validate } from '../middlewares/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  chatHistorySchema,
  chatImageSchema,
  clearHistorySchema,
  sendChatSchema,
} from '../validators/chat.validator.js'

export const chatRouter = Router()

chatRouter.use(requireAuth)
// JSON thuần hoặc multipart (kèm tối đa 4 ảnh trong trường "images")
chatRouter.post(
  '/',
  chatLimiter,
  uploadImage.array('images', 4),
  validate(sendChatSchema),
  asyncHandler(ctrl.send),
)
chatRouter.get('/:id/image/:index', validate(chatImageSchema), asyncHandler(ctrl.image))
chatRouter.get('/history', validate(chatHistorySchema), asyncHandler(ctrl.history))
chatRouter.delete('/history', validate(clearHistorySchema), asyncHandler(ctrl.clear))
