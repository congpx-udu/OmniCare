import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js'
import { apiRouter } from './routes/index.js'

export const app = express()

// Đứng sau reverse proxy (Vite dev proxy, nginx, Docker): tin 1 hop để rate-limit đọc đúng IP client
app.set('trust proxy', 1)
app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN.split(','), credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/api/health' } }))

app.use('/api', apiRouter)

app.use(notFound)
app.use(errorHandler)
