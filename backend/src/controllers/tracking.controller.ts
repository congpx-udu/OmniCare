import type { Request, Response } from 'express'
import * as trackingService from '../services/tracking.service.js'
import { created, ok } from '../utils/response.js'
import type { ListAdviceQuery, ListLogsQuery } from '../validators/tracking.validator.js'

export async function upsertLog(req: Request, res: Response) {
  const { date } = res.locals.params as { date: string }
  ok(res, await trackingService.upsertLog(req.userId!, date, req.body), 'Đã lưu nhật ký')
}

export async function listLogs(req: Request, res: Response) {
  ok(res, await trackingService.listLogs(req.userId!, res.locals.query as ListLogsQuery))
}

export async function deleteLog(req: Request, res: Response) {
  const { date } = res.locals.params as { date: string }
  ok(res, await trackingService.deleteLog(req.userId!, date), 'Đã xóa nhật ký')
}

export async function analyze(req: Request, res: Response) {
  created(res, await trackingService.analyze(req.userId!, req.body), 'Đã phân tích nhật ký')
}

export async function listAdvice(req: Request, res: Response) {
  ok(res, await trackingService.listAdvice(req.userId!, res.locals.query as ListAdviceQuery))
}

export async function suggestionDone(req: Request, res: Response) {
  const { id, index } = res.locals.params as { id: string; index: number }
  ok(res, await trackingService.setSuggestionDone(req.userId!, id, index, req.body.done))
}
