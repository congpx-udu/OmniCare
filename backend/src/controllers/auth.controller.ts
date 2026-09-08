import type { Request, Response } from 'express'
import * as authService from '../services/auth.service.js'
import { created, ok } from '../utils/response.js'

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body)
  created(res, result, 'Đăng ký thành công')
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body)
  ok(res, result)
}

export async function me(req: Request, res: Response) {
  const user = await authService.me(req.userId!)
  ok(res, user)
}
