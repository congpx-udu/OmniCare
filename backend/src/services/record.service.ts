import { readFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { MedicalRecord, type RecordStatus, type RecordType } from '../models/MedicalRecord.js'
import { ApiError } from '../utils/ApiError.js'
import type {
  ListRecordsQuery,
  UpdateRecordInput,
  UploadRecordInput,
} from '../validators/record.validator.js'

const AI_TIMEOUT_MS = 150_000
const UPLOAD_DIR = path.resolve('uploads')

// ---------- Schema response AI /ocr ----------

const medicationSchema = z.object({
  name: z.string(),
  dose: z.string().nullable().default(null),
  frequency: z.string().nullable().default(null),
  quantity: z.string().nullable().default(null),
  duration: z.string().nullable().default(null),
  instructions: z.string().nullable().default(null),
})

const ocrSchema = z.object({
  document_type: z.enum(['prescription', 'medical_record', 'lab_result', 'other']),
  facility: z.string().nullable().default(null),
  doctor: z.string().nullable().default(null),
  visit_date: z.string().nullable().default(null),
  diagnosis: z.string().nullable().default(null),
  medications: z.array(medicationSchema).default([]),
  medication_table: z
    .object({
      columns: z.array(z.object({ key: z.string(), label: z.string() })).default([]),
      rows: z.array(z.record(z.string(), z.string().nullable())).default([]),
    })
    .default({ columns: [], rows: [] }),
  notes: z.string().nullable().default(null),
  raw_text: z.string(),
  confidence: z.number(),
  pages_read: z.number().optional(),
  warnings: z.array(z.string()).default([]),
  model: z.string(),
  latency_ms: z.number(),
})

// ---------- Public shape ----------

export interface PublicMedication {
  name: string
  dose: string | null
  frequency: string | null
  quantity: string | null
  duration: string | null
  instructions: string | null
}

export interface MedicationTable {
  columns: Array<{ key: string; label: string }>
  rows: Array<Record<string, string | null>>
}

export interface PublicRecord {
  id: string
  type: RecordType
  status: RecordStatus
  facility: string | null
  doctor: string | null
  /** yyyy-mm-dd */
  visitDate: string | null
  diagnosis: string | null
  medications: PublicMedication[]
  /** Bảng thuốc đúng cột của tài liệu, dùng để hiển thị và sửa tay */
  medicationTable: MedicationTable
  notes: string | null
  rawText: string | null
  confidence: number | null
  warnings: string[]
  errorMessage: string | null
  /** Các trang ảnh; xem từng trang qua /records/:id/image/:page (0-based) */
  pages: Array<{ mime: string; size: number }>
  createdAt: string
  updatedAt: string
}

interface RecordSource {
  _id: unknown
  type: string
  status: string
  facility?: string | null
  doctor?: string | null
  visitDate?: Date | null
  diagnosis?: string | null
  medications?: Array<Partial<PublicMedication> & { name: string }>
  medicationTable?: {
    columns?: Array<{ key?: string | null; label?: string | null }>
    rows?: unknown[]
  } | null
  notes?: string | null
  rawText?: string | null
  confidence?: number | null
  warnings?: string[]
  errorMessage?: string | null
  pages?: Array<{ path: string; mime: string; size: number }>
  createdAt?: Date
  updatedAt?: Date
}

function toPublic(r: RecordSource): PublicRecord {
  return {
    id: String(r._id),
    type: r.type as RecordType,
    status: r.status as RecordStatus,
    facility: r.facility ?? null,
    doctor: r.doctor ?? null,
    visitDate: r.visitDate ? r.visitDate.toISOString().slice(0, 10) : null,
    diagnosis: r.diagnosis ?? null,
    medications: (r.medications ?? []).map((m) => ({
      name: m.name,
      dose: m.dose ?? null,
      frequency: m.frequency ?? null,
      quantity: m.quantity ?? null,
      duration: m.duration ?? null,
      instructions: m.instructions ?? null,
    })),
    medicationTable: r.medicationTable?.columns?.length
      ? {
          columns: r.medicationTable.columns.map((c) => ({
            key: String(c.key ?? ''),
            label: String(c.label ?? ''),
          })),
          rows: (r.medicationTable.rows ?? []) as Array<Record<string, string | null>>,
        }
      : tableFromMedications(r.medications ?? []),
    notes: r.notes ?? null,
    rawText: r.rawText ?? null,
    confidence: r.confidence ?? null,
    warnings: r.warnings ?? [],
    errorMessage: r.errorMessage ?? null,
    pages: (r.pages ?? []).map((p) => ({ mime: p.mime, size: p.size })),
    createdAt: (r.createdAt ?? new Date()).toISOString(),
    updatedAt: (r.updatedAt ?? new Date()).toISOString(),
  }
}

/** Hồ sơ cũ chưa có bảng theo tài liệu: dựng bảng mặc định từ medications chuẩn hóa */
function tableFromMedications(
  meds: Array<Partial<PublicMedication> & { name: string }>,
): MedicationTable {
  const columns = [
    { key: 'name', label: 'Tên thuốc' },
    { key: 'dose', label: 'Liều mỗi lần' },
    { key: 'frequency', label: 'Số lần / ngày' },
    { key: 'quantity', label: 'Số lượng' },
    { key: 'duration', label: 'Số ngày' },
    { key: 'instructions', label: 'Cách dùng' },
  ]
  const rows = meds.map((m) => ({
    name: m.name,
    dose: m.dose ?? null,
    frequency: m.frequency ?? null,
    quantity: m.quantity ?? null,
    duration: m.duration ?? null,
    instructions: m.instructions ?? null,
  }))
  return { columns, rows }
}

/** Suy ra medications chuẩn hóa từ bảng người dùng đã sửa: đoán cột theo tên cột */
function medicationsFromTable(table: MedicationTable): PublicMedication[] {
  const find = (re: RegExp) => table.columns.find((c) => re.test(c.label.toLowerCase()))?.key
  const nameKey = find(/tên|thuốc|name|drug|biệt dược/) ?? table.columns[0]?.key
  const doseKey = find(/liều|dose|hàm lượng mỗi|mỗi lần/)
  const freqKey = find(/số lần|lần\/|tần suất|frequency|sáng|chiều|tối/)
  const qtyKey = find(/^sl$|số lượng|s\.l|quantity|đvt|số viên/)
  const durKey = find(/số ngày|ngày dùng|thời gian|duration/)
  const insKey = find(/cách dùng|hướng dẫn|ghi chú|lưu ý|instruction|usage/)
  const pick = (row: Record<string, string | null>, key?: string) =>
    key ? (row[key] ?? null) : null
  return table.rows
    .map((row) => ({
      name: (nameKey ? row[nameKey] : null) ?? '',
      dose: pick(row, doseKey),
      frequency: pick(row, freqKey),
      quantity: pick(row, qtyKey),
      duration: pick(row, durKey),
      instructions: pick(row, insKey),
    }))
    .filter((m) => m.name.trim())
}

/** Chỉ cho phép file trong uploads/ (tránh path traversal nếu DB bị sửa) */
function safeImagePath(imagePath: string) {
  const abs = path.resolve(imagePath)
  if (!abs.startsWith(UPLOAD_DIR + path.sep)) throw ApiError.notFound('Không tìm thấy ảnh')
  return abs
}

function parseVisitDate(s: string | null) {
  if (!s) return null
  const d = new Date(`${s}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

// ---------- OCR qua AI service ----------

async function runOcr(pages: Array<{ path: string; mime: string }>, hint?: RecordType) {
  const images = await Promise.all(
    pages.map(async (p) => ({
      image_base64: (await readFile(safeImagePath(p.path))).toString('base64'),
      mime_type: p.mime,
    })),
  )
  let res: Response
  try {
    res = await fetch(`${env.AI_SERVICE_URL}/ocr`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ images, hint_type: hint ?? null }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    })
  } catch (err) {
    logger.warn({ err }, 'AI service unreachable (ocr)')
    throw new ApiError(504, 'Dịch vụ OCR đang bận, vui lòng thử lại sau')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null
    logger.warn({ status: res.status, detail: body?.detail }, 'AI ocr error')
    if (res.status === 422) throw new ApiError(422, body?.detail ?? 'Không đọc được nội dung ảnh')
    if (res.status === 503) throw new ApiError(503, body?.detail ?? 'Dịch vụ OCR chưa sẵn sàng')
    throw new ApiError(502, 'Dịch vụ OCR trả lỗi, vui lòng thử lại')
  }
  const parsed = ocrSchema.safeParse(await res.json())
  if (!parsed.success) {
    logger.warn({ issues: parsed.error.issues.slice(0, 3) }, 'AI ocr mismatch')
    throw new ApiError(502, 'Phản hồi OCR không hợp lệ')
  }
  return parsed.data
}

/** Chạy OCR và ghi kết quả vào record; lỗi thì đánh dấu failed nhưng vẫn giữ ảnh */
async function processRecord(recordId: string, userId: string, hint?: RecordType) {
  const record = await MedicalRecord.findOne({ _id: recordId, user: userId })
  if (!record) throw ApiError.notFound('Không tìm thấy hồ sơ')
  record.status = 'pending'
  record.errorMessage = undefined
  await record.save()
  try {
    const ocr = await runOcr(record.pages, hint)
    record.set({
      type: ocr.document_type,
      status: 'needs_review',
      facility: ocr.facility,
      doctor: ocr.doctor,
      visitDate: parseVisitDate(ocr.visit_date),
      diagnosis: ocr.diagnosis,
      medications: ocr.medications,
      medicationTable: ocr.medication_table,
      notes: ocr.notes,
      rawText: ocr.raw_text,
      confidence: ocr.confidence,
      warnings: ocr.warnings,
      ocrModel: ocr.model,
    })
  } catch (err) {
    record.status = 'failed'
    record.errorMessage = err instanceof ApiError ? err.message : 'OCR thất bại'
    await record.save()
    throw err
  }
  await record.save()
  return toPublic(record)
}

// ---------- Public API ----------

/** Một lần upload = một bộ hồ sơ nhiều trang; AI đọc tất cả trang và gộp thành một kết quả */
export async function uploadRecord(
  userId: string,
  files: Express.Multer.File[],
  input: UploadRecordInput,
) {
  const record = await MedicalRecord.create({
    user: userId,
    type: input.type ?? 'other',
    status: 'pending',
    pages: files.map((f) => ({ path: f.path, mime: f.mimetype, size: f.size })),
  })
  return processRecord(String(record._id), userId, input.type)
}

export async function reprocessRecord(userId: string, id: string) {
  return processRecord(id, userId)
}

export async function listRecords(userId: string, query: ListRecordsQuery) {
  const filter: Record<string, unknown> = { user: userId }
  if (query.year) {
    filter.visitDate = {
      $gte: new Date(Date.UTC(query.year, 0, 1)),
      $lt: new Date(Date.UTC(query.year + 1, 0, 1)),
    }
  }
  if (query.q) {
    const re = new RegExp(query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ diagnosis: re }, { facility: re }, { 'medications.name': re }, { notes: re }]
  }
  const docs = await MedicalRecord.find(filter)
    .sort({ visitDate: -1, createdAt: -1 })
    .limit(query.limit)
    .lean()
  return docs.map(toPublic)
}

export async function getRecord(userId: string, id: string) {
  const doc = await MedicalRecord.findOne({ _id: id, user: userId }).lean()
  if (!doc) throw ApiError.notFound('Không tìm thấy hồ sơ')
  return toPublic(doc)
}

/** Đường dẫn tuyệt đối + mime để controller gửi file (đã kiểm tra chủ sở hữu) */
export async function getRecordImage(userId: string, id: string, page: number) {
  const doc = await MedicalRecord.findOne({ _id: id, user: userId }).select('pages').lean()
  if (!doc) throw ApiError.notFound('Không tìm thấy hồ sơ')
  const p = doc.pages?.[page]
  if (!p) throw ApiError.notFound('Không tìm thấy trang ảnh')
  return { absolutePath: safeImagePath(p.path), mime: p.mime }
}

export async function updateRecord(userId: string, id: string, input: UpdateRecordInput) {
  const record = await MedicalRecord.findOne({ _id: id, user: userId })
  if (!record) throw ApiError.notFound('Không tìm thấy hồ sơ')
  const { confirm, medicationTable, ...fields } = input
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) record.set(key, value)
  }
  if (medicationTable) {
    record.set('medicationTable', medicationTable)
    // Bảng là nguồn sự thật người dùng nhìn thấy; đồng bộ bản chuẩn hóa để chat/đếm không lệch
    if (input.medications === undefined)
      record.set('medications', medicationsFromTable(medicationTable))
  }
  if (confirm) record.status = 'done'
  else if (record.status === 'failed' || record.status === 'pending') record.status = 'needs_review'
  await record.save()
  return toPublic(record)
}

export async function deleteRecord(userId: string, id: string) {
  const record = await MedicalRecord.findOneAndDelete({ _id: id, user: userId })
  if (!record) throw ApiError.notFound('Không tìm thấy hồ sơ')
  for (const p of record.pages ?? []) {
    try {
      await unlink(safeImagePath(p.path))
    } catch (err) {
      logger.warn({ err }, 'could not delete record image')
    }
  }
  return { deleted: true }
}

/** Tóm tắt ngắn các bệnh án đã xác nhận, đưa vào ngữ cảnh chat (không có tên bác sĩ/cơ sở để giảm PII) */
export async function summarizeRecords(userId: string, limit = 5) {
  const docs = await MedicalRecord.find({ user: userId, status: 'done' })
    .sort({ visitDate: -1, createdAt: -1 })
    .limit(limit)
    .select('visitDate diagnosis medications')
    .lean()
  if (!docs.length) return null
  return docs
    .map((d) => {
      const date = d.visitDate ? d.visitDate.toISOString().slice(0, 10) : 'không rõ ngày'
      const meds = (d.medications ?? [])
        .map((m) => m.name)
        .slice(0, 6)
        .join(', ')
      return `- ${date}: ${d.diagnosis ?? 'không rõ chẩn đoán'}${meds ? ` | thuốc: ${meds}` : ''}`
    })
    .join('\n')
}
