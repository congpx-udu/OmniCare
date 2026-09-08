import { Router } from 'express'
import * as ctrl from '../controllers/auth.controller.js'
import { requireAuth } from '../middlewares/auth.js'
import { loginLimiter, registerLimiter } from '../middlewares/rateLimit.js'
import { validate } from '../middlewares/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { loginSchema, registerSchema } from '../validators/auth.validator.js'

export const authRouter = Router()

authRouter.post('/register', registerLimiter, validate(registerSchema), asyncHandler(ctrl.register))
authRouter.post('/login', loginLimiter, validate(loginSchema), asyncHandler(ctrl.login))
authRouter.get('/me', requireAuth, asyncHandler(ctrl.me))
