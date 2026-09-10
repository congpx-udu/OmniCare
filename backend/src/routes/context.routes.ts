import { Router } from 'express'
import * as ctrl from '../controllers/context.controller.js'
import { requireAuth } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { weatherQuerySchema } from '../validators/context.validator.js'

export const contextRouter = Router()

contextRouter.use(requireAuth)
contextRouter.get('/weather', validate(weatherQuerySchema), asyncHandler(ctrl.weather))
contextRouter.get(
  '/weather/insight',
  validate(weatherQuerySchema),
  asyncHandler(ctrl.weatherInsight),
)
