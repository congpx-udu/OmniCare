import { Router } from 'express'
import * as ctrl from '../controllers/record.controller.js'
import { requireAuth } from '../middlewares/auth.js'
import { ocrLimiter } from '../middlewares/rateLimit.js'
import { uploadImage } from '../middlewares/upload.js'
import { validate } from '../middlewares/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  listRecordsSchema,
  recordIdSchema,
  recordPageSchema,
  updateRecordSchema,
  uploadRecordSchema,
} from '../validators/record.validator.js'

export const recordRouter = Router()

recordRouter.use(requireAuth)
recordRouter.post(
  '/upload',
  ocrLimiter,
  uploadImage.array('images', 8),
  validate(uploadRecordSchema),
  asyncHandler(ctrl.upload),
)
recordRouter.get('/', validate(listRecordsSchema), asyncHandler(ctrl.list))
recordRouter.get('/:id', validate(recordIdSchema), asyncHandler(ctrl.detail))
recordRouter.get('/:id/image/:page', validate(recordPageSchema), asyncHandler(ctrl.image))
recordRouter.get('/:id/image', validate(recordPageSchema), asyncHandler(ctrl.image))
recordRouter.put('/:id', validate(updateRecordSchema), asyncHandler(ctrl.update))
recordRouter.post(
  '/:id/reprocess',
  ocrLimiter,
  validate(recordIdSchema),
  asyncHandler(ctrl.reprocess),
)
recordRouter.delete('/:id', validate(recordIdSchema), asyncHandler(ctrl.remove))
