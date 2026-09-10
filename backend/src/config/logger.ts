import pino from 'pino'
import { isProd } from './env.js'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug'),
  transport:
    isProd || process.env.NODE_ENV === 'test'
      ? undefined
      : { target: 'pino-pretty', options: { colorize: true } },
  // Không bao giờ log dữ liệu sức khỏe / PII
  redact: ['req.headers.authorization', 'password', 'token'],
})
