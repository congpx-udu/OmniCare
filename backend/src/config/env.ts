import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET phải dài tối thiểu 16 ký tự'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  OPENWEATHER_API_KEY: z.string().optional(),
  AI_SERVICE_URL: z.string().url().default('http://localhost:8000'),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('❌ Biến môi trường không hợp lệ:', z.treeifyError(parsed.error))
  process.exit(1)
}

export const env = parsed.data
export const isProd = env.NODE_ENV === 'production'
