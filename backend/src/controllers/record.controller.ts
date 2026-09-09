import type { Request, Response } from 'express'
import * as recordService from '../services/record.service.js'
import { ApiError } from '../utils/ApiError.js'
import { created, ok } from '../utils/response.js'
import type { ListRecordsQuery } from '../validators/record.validator.js'

export async function upload(req: Request, res: Response) {
  if (!req.file) throw ApiError.badRequest('Vui lòng chọn ảnh (trường "image")')
  const record = await recordService.uploadRecord(req.userId!, req.file, req.body)
  created(res, record, 'Đã đọc xong, vui lòng kiểm tra và xác nhận')
}

export async function list(req: Request, res: Response) {
  const query = res.locals.query as ListRecordsQuery
  ok(res, await recordService.listRecords(req.userId!, query))
}

export async function detail(req: Request, res: Response) {
  ok(res, await recordService.getRecord(req.userId!, req.params.id as string))
}

export async function image(req: Request, res: Response) {
  const { absolutePath, mime } = await recordService.getRecordImage(
    req.userId!,
    req.params.id as string,
  )
  res.type(mime)
  res.setHeader('Cache-Control', 'private, max-age=3600')
  res.sendFile(absolutePath)
}

export async function update(req: Request, res: Response) {
  const record = await recordService.updateRecord(req.userId!, req.params.id as string, req.body)
  ok(res, record, record.status === 'done' ? 'Đã lưu hồ sơ' : 'Đã cập nhật')
}

export async function reprocess(req: Request, res: Response) {
  ok(res, await recordService.reprocessRecord(req.userId!, req.params.id as string), 'Đã đọc lại')
}

export async function remove(req: Request, res: Response) {
  ok(res, await recordService.deleteRecord(req.userId!, req.params.id as string), 'Đã xóa hồ sơ')
}
