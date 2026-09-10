/**
 * Thiết lập chung cho test tích hợp:
 * - Biến môi trường tối thiểu (env.ts parse lúc import nên phải đặt TRƯỚC khi import app).
 * - Kết nối MongoDB test (MONGO_URI_TEST, mặc định mongo local từ docker compose), xóa sạch trước mỗi file.
 * - Dịch vụ AI giả lập trên cổng ngẫu nhiên để test chat / OCR / tracking không cần LLM thật.
 */
import { createServer, type Server } from 'node:http'
import mongoose from 'mongoose'
import { afterAll, beforeAll, beforeEach } from 'vitest'

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET ??= 'test-only-secret-please-change-0123456789'
process.env.MONGO_URI = process.env.MONGO_URI_TEST ?? 'mongodb://localhost:27017/omnicare_test'
process.env.OPENWEATHER_API_KEY = ''
process.env.LOG_LEVEL = 'silent'

let aiServer: Server

/** AI giả lập: trả JSON đúng schema cho từng endpoint, nội dung phụ thuộc mode/hint */
function startMockAi() {
  return new Promise<number>((resolve) => {
    aiServer = createServer((req, res) => {
      let body = ''
      req.on('data', (c) => (body += c))
      req.on('end', () => {
        const payload = body ? (JSON.parse(body) as Record<string, unknown>) : {}
        const json = (data: unknown, status = 200) => {
          res.writeHead(status, { 'content-type': 'application/json' })
          res.end(JSON.stringify(data))
        }
        if (req.url === '/health') return json({ status: 'ok', llm_configured: true })
        if (req.url === '/chat') {
          const mode = payload.mode as string
          const msgs = payload.messages as Array<{ content: string }>
          const askFood = mode === 'food' || (mode === 'health' && /ăn/i.test(msgs.at(-1)?.content ?? ''))
          return json({
            mode,
            intent: mode === 'health' ? (askFood ? 'food' : 'symptom') : 'general',
            reply: askFood ? 'Gợi ý bữa tối nhẹ.' : 'Bạn nên theo dõi tại nhà.',
            risk_level: askFood ? 'none' : 'home',
            possible_conditions: askFood ? [] : [{ name: 'Căng thẳng', why: 'ngủ ít' }],
            suggested_specialty: askFood ? null : 'Nội tổng quát',
            facility_type: null,
            follow_up_questions: ['Bạn có sốt không?'],
            meals:
              askFood
                ? [{ name: 'Cháo gà', why: 'nhẹ', ingredients: ['gà'], notes: null }]
                : [],
            activities: [],
            disclaimer: 'Test disclaimer',
            model: 'mock',
            latency_ms: 1,
          })
        }
        if (req.url === '/ocr') {
          const images = (payload.images as unknown[]) ?? []
          return json({
            document_type: 'prescription',
            facility: 'BV Test',
            doctor: 'BS Test',
            visit_date: '2026-09-05',
            diagnosis: 'Viêm họng cấp',
            medications: [
              {
                name: 'Amoxicillin 500mg',
                dose: '1 viên',
                frequency: '3 lần/ngày',
                quantity: '21 viên',
                duration: '7 ngày',
                instructions: null,
              },
            ],
            medication_table: {
              columns: [
                { key: 'ten_thuoc', label: 'Tên thuốc' },
                { key: 'sl', label: 'SL' },
              ],
              rows: [{ ten_thuoc: 'Amoxicillin 500mg', sl: '21 viên' }],
            },
            notes: null,
            raw_text: images.map((_, i) => `--- Trang ${i + 1} ---\nnội dung`).join('\n'),
            pages_read: images.length,
            confidence: 0.9,
            warnings: [],
            model: 'mock',
            latency_ms: 1,
          })
        }
        if (req.url === '/insights/tracking') {
          return json({
            summary: 'Tóm tắt test',
            trends: [{ metric: 'Cân nặng', direction: 'down', comment: 'giảm' }],
            alerts: [{ level: 'warning', message: 'Huyết áp cao' }],
            suggestions: [
              { title: 'Ngủ sớm', detail: 'trước 23h', category: 'sleep', when: 'tối nay' },
            ],
            disclaimer: 'Test disclaimer',
            model: 'mock',
            latency_ms: 1,
          })
        }
        json({ detail: 'not found' }, 404)
      })
    })
    aiServer.listen(0, '127.0.0.1', () => {
      const addr = aiServer.address()
      resolve(typeof addr === 'object' && addr ? addr.port : 0)
    })
  })
}

beforeAll(async () => {
  const port = await startMockAi()
  process.env.AI_SERVICE_URL = `http://127.0.0.1:${port}`
  await mongoose.connect(process.env.MONGO_URI!)
})

beforeEach(async () => {
  const collections = await mongoose.connection.db!.collections()
  await Promise.all(collections.map((c) => c.deleteMany({})))
})

afterAll(async () => {
  await mongoose.disconnect()
  aiServer?.close()
})
