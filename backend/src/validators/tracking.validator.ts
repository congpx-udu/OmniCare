import { z } from 'zod'
import { ACTIVITY_TYPES } from '../models/HealthLog.js'

const ymd = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ')
  .refine((s) => !Number.isNaN(new Date(`${s}T00:00:00.000Z`).getTime()), 'Ngày không hợp lệ')

const num = (min: number, max: number, label: string) =>
  z
    .number()
    .min(min, `${label} tối thiểu ${min}`)
    .max(max, `${label} tối đa ${max}`)
    .nullable()
    .optional()

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'ID không hợp lệ')

/** PUT /tracking/logs/:date — upsert nhật ký của một ngày; null = xóa chỉ số đó */
export const upsertLogSchema = z.object({
  params: z.object({ date: ymd }),
  body: z
    .object({
      weightKg: num(2, 500, 'Cân nặng'),
      systolic: num(50, 300, 'Huyết áp tâm thu'),
      diastolic: num(30, 200, 'Huyết áp tâm trương'),
      heartRate: num(20, 250, 'Nhịp tim'),
      glucose: num(1, 40, 'Đường huyết'),
      sleepHours: num(0, 24, 'Giờ ngủ'),
      activityMinutes: num(0, 1440, 'Phút vận động'),
      activityType: z.enum(ACTIVITY_TYPES).nullable().optional(),
      mood: z.number().int().min(1).max(5).nullable().optional(),
      note: z.string().trim().max(500).nullable().optional(),
    })
    .refine((b) => !(b.systolic != null && b.diastolic != null) || b.systolic > b.diastolic, {
      message: 'Huyết áp tâm thu phải lớn hơn tâm trương',
      path: ['systolic'],
    }),
})

export const listLogsSchema = z.object({
  query: z.object({
    from: ymd.optional(),
    to: ymd.optional(),
    limit: z.coerce.number().int().min(1).max(366).default(90),
  }),
})

export const logDateSchema = z.object({ params: z.object({ date: ymd }) })

/** POST /tracking/analyze — vị trí để lấy thời tiết (tùy chọn), số ngày nhìn lại */
export const analyzeSchema = z.object({
  body: z.object({
    days: z.number().int().min(7).max(60).default(30),
    location: z
      .union([
        z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }),
        z.object({ city: z.string().trim().min(2).max(80) }),
      ])
      .optional(),
  }),
})

export const listAdviceSchema = z.object({
  query: z.object({ limit: z.coerce.number().int().min(1).max(20).default(5) }),
})

export const suggestionDoneSchema = z.object({
  params: z.object({ id: objectId, index: z.coerce.number().int().min(0).max(9) }),
  body: z.object({ done: z.boolean() }),
})

export type UpsertLogInput = z.infer<typeof upsertLogSchema>['body']
export type ListLogsQuery = z.infer<typeof listLogsSchema>['query']
export type AnalyzeInput = z.infer<typeof analyzeSchema>['body']
export type ListAdviceQuery = z.infer<typeof listAdviceSchema>['query']
