import mongoose from 'mongoose'
import { env } from '../config/env.js'

export type ServiceStatus = 'ok' | 'unreachable'

/** Ping dịch vụ AI (../ai) qua GET /health, timeout ngắn để không kéo chậm /api/health */
export async function checkAiService(timeoutMs = 2000): Promise<ServiceStatus> {
  try {
    const res = await fetch(`${env.AI_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(timeoutMs),
    })
    return res.ok ? 'ok' : 'unreachable'
  } catch {
    return 'unreachable'
  }
}

export async function getHealth() {
  const ai = await checkAiService()
  return {
    status: 'ok' as const,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    ai,
    uptime: process.uptime(),
  }
}
