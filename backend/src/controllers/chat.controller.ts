import type { Request, Response } from 'express'
import * as chatService from '../services/chat.service.js'
import { created, ok } from '../utils/response.js'
import type {
  ChatHistoryQuery,
  ChatImageParams,
  ClearHistoryQuery,
} from '../validators/chat.validator.js'

export async function send(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[] | undefined) ?? []
  created(res, await chatService.sendMessage(req.userId!, req.body, files))
}

export async function image(req: Request, res: Response) {
  const params = res.locals.params as ChatImageParams
  const { absolutePath, mime } = await chatService.getAttachment(
    req.userId!,
    params.id,
    params.index,
  )
  res.type(mime)
  res.setHeader('Cache-Control', 'private, max-age=3600')
  res.sendFile(absolutePath)
}

export async function history(_req: Request, res: Response) {
  const query = res.locals.query as ChatHistoryQuery
  ok(res, await chatService.getHistory(_req.userId!, query))
}

export async function clear(req: Request, res: Response) {
  const query = res.locals.query as ClearHistoryQuery
  ok(res, await chatService.clearHistory(req.userId!, query.mode), 'Đã xóa lịch sử')
}
