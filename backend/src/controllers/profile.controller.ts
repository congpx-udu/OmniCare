import type { Request, Response } from 'express'
import * as profileService from '../services/profile.service.js'
import { ok } from '../utils/response.js'

export async function getProfile(req: Request, res: Response) {
  ok(res, await profileService.getProfile(req.userId!))
}

export async function updateProfile(req: Request, res: Response) {
  const profile = await profileService.updateProfile(req.userId!, req.body)
  ok(res, profile, 'Đã lưu hồ sơ sức khỏe')
}
