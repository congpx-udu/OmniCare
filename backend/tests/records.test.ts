import { mkdirSync } from 'node:fs'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { auth, registerAndLogin } from './helpers.js'

// PNG 1x1 hợp lệ để multer nhận mime image/png
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)
mkdirSync('uploads', { recursive: true })

describe('records', () => {
  it('upload 2 trang → OCR gộp → needs_review; ảnh từng trang chỉ chủ sở hữu xem được', async () => {
    const a = await registerAndLogin('A')
    const b = await registerAndLogin('B')
    const up = await request(a.app)
      .post('/api/records/upload')
      .set(auth(a.token))
      .attach('images', PNG, { filename: 'p1.png', contentType: 'image/png' })
      .attach('images', PNG, { filename: 'p2.png', contentType: 'image/png' })
      .expect(201)
    const rec = up.body.data
    expect(rec.status).toBe('needs_review')
    expect(rec.pages).toHaveLength(2)
    expect(rec.medications[0].quantity).toBe('21 viên')
    expect(rec.medicationTable.columns.map((c: { label: string }) => c.label)).toEqual([
      'Tên thuốc',
      'SL',
    ])
    expect(rec.rawText).toContain('--- Trang 2 ---')

    await request(a.app).get(`/api/records/${rec.id}/image/1`).set(auth(a.token)).expect(200)
    await request(a.app).get(`/api/records/${rec.id}/image/2`).set(auth(a.token)).expect(404)
    await request(b.app).get(`/api/records/${rec.id}`).set(auth(b.token)).expect(404)
    await request(b.app).get(`/api/records/${rec.id}/image/0`).set(auth(b.token)).expect(404)
    await request(a.app).get(`/api/records/${rec.id}/image/0`).expect(401)
  })

  it('sửa bảng thuốc → medications suy ra từ bảng, confirm → done, tìm kiếm, xóa', async () => {
    const { app, token } = await registerAndLogin()
    const up = await request(app)
      .post('/api/records/upload')
      .set(auth(token))
      .attach('images', PNG, { filename: 'p1.png', contentType: 'image/png' })
      .expect(201)
    const id = up.body.data.id

    const put = await request(app)
      .put(`/api/records/${id}`)
      .set(auth(token))
      .send({
        diagnosis: 'Viêm họng cấp J02.9',
        medicationTable: {
          columns: [
            { key: 'ten_thuoc', label: 'Tên thuốc' },
            { key: 'sl', label: 'SL' },
            { key: 'cach_dung', label: 'Cách dùng' },
          ],
          rows: [
            { ten_thuoc: 'Amoxicillin 500mg', sl: '21 viên', cach_dung: '3 lần/ngày' },
            { ten_thuoc: 'Paracetamol 500mg', sl: '10 viên', cach_dung: null },
          ],
        },
        confirm: true,
      })
      .expect(200)
    expect(put.body.data.status).toBe('done')
    expect(put.body.data.medications.map((m: { name: string }) => m.name)).toEqual([
      'Amoxicillin 500mg',
      'Paracetamol 500mg',
    ])
    expect(put.body.data.medications[0].quantity).toBe('21 viên')
    expect(put.body.data.medications[0].instructions).toBe('3 lần/ngày')

    const found = await request(app).get('/api/records?q=paracet').set(auth(token)).expect(200)
    expect(found.body.data).toHaveLength(1)
    const none = await request(app).get('/api/records?q=khongco').set(auth(token)).expect(200)
    expect(none.body.data).toHaveLength(0)

    await request(app).delete(`/api/records/${id}`).set(auth(token)).expect(200)
    await request(app).get(`/api/records/${id}`).set(auth(token)).expect(404)
  })

  it('từ chối file không phải ảnh và upload rỗng', async () => {
    const { app, token } = await registerAndLogin()
    await request(app)
      .post('/api/records/upload')
      .set(auth(token))
      .attach('images', Buffer.from('hello'), { filename: 'a.txt', contentType: 'text/plain' })
      .expect(400)
    await request(app).post('/api/records/upload').set(auth(token)).expect(400)
  })
})
