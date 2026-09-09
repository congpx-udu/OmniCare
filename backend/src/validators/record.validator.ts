import { z } from 'zod'
import { RECORD_TYPES } from '../models/MedicalRecord.js'

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'ID không hợp lệ')

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional()

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ')
  .transform((s) => new Date(`${s}T00:00:00.000Z`))
  .refine((d) => !Number.isNaN(d.getTime()), 'Ngày không hợp lệ')
  .nullable()
  .optional()

const medicationSchema = z.object({
  name: z.string().trim().min(1, 'Tên thuốc không được trống').max(200),
  dose: optionalText(100),
  frequency: optionalText(150),
  duration: optionalText(100),
  instructions: optionalText(300),
})

export const uploadRecordSchema = z.object({
  body: z.object({
    /** Gợi ý loại tài liệu (tùy chọn), AI vẫn tự nhận dạng */
    type: z.enum(RECORD_TYPES).optional(),
  }),
})

export const recordIdSchema = z.object({
  params: z.object({ id: objectId }),
})

export const recordPageSchema = z.object({
  params: z.object({
    id: objectId,
    page: z.coerce.number().int().min(0).max(7).default(0),
  }),
})

export const listRecordsSchema = z.object({
  query: z.object({
    year: z.coerce.number().int().min(1900).max(2100).optional(),
    q: z.string().trim().max(100).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
})

/** PUT /records/:id — người dùng sửa tay dữ liệu bóc tách rồi xác nhận */
export const updateRecordSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    type: z.enum(RECORD_TYPES).optional(),
    facility: optionalText(200),
    doctor: optionalText(120),
    visitDate: dateSchema,
    diagnosis: optionalText(1000),
    medications: z.array(medicationSchema).max(30).optional(),
    notes: optionalText(2000),
    /** true = đánh dấu đã xác nhận (status done) */
    confirm: z.boolean().optional(),
  }),
})

export type UploadRecordInput = z.infer<typeof uploadRecordSchema>['body']
export type ListRecordsQuery = z.infer<typeof listRecordsSchema>['query']
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>['body']
