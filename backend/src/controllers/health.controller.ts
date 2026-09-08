import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import { ok } from '../utils/response.js'

export function healthCheck(_req: Request, res: Response) {
  ok(res, {
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  })
}
