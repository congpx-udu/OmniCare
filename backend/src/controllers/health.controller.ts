import type { Request, Response } from 'express'
import { getHealth } from '../services/health.service.js'
import { ok } from '../utils/response.js'

export async function healthCheck(_req: Request, res: Response) {
  ok(res, await getHealth())
}
