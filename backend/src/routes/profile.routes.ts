import { Router } from 'express'
import * as ctrl from '../controllers/profile.controller.js'
import { requireAuth } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { updateProfileSchema } from '../validators/profile.validator.js'

export const profileRouter = Router()

profileRouter.use(requireAuth)
profileRouter.get('/', asyncHandler(ctrl.getProfile))
profileRouter.put('/', validate(updateProfileSchema), asyncHandler(ctrl.updateProfile))
