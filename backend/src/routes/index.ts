import { Router } from 'express'
import { healthCheck } from '../controllers/health.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { authRouter } from './auth.routes.js'
import { contextRouter } from './context.routes.js'
import { profileRouter } from './profile.routes.js'

export const apiRouter = Router()

apiRouter.get('/health', asyncHandler(healthCheck))
apiRouter.use('/auth', authRouter)
apiRouter.use('/profile', profileRouter)
apiRouter.use('/context', contextRouter)
// TODO: /chat, /records
