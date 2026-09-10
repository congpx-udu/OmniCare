import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { auth, getApp, registerAndLogin } from './helpers.js'

describe('error handling', () => {
  it('JSON hỏng → 400, route lạ → 404, không lộ stack', async () => {
    const app = await getApp()
    const bad = await request(app)
      .post('/api/auth/login')
      .set('content-type', 'application/json')
      .send('{"phone": ')
      .expect(400)
    expect(bad.body).toEqual({ success: false, message: 'JSON không hợp lệ' })
    const nf = await request(app).get('/api/khong-ton-tai').expect(404)
    expect(nf.body.success).toBe(false)
    expect(nf.body.stack).toBeUndefined()
  })

  it('upload quá số trang → 400 rõ ràng', async () => {
    const { app, token } = await registerAndLogin()
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64',
    )
    let req = request(app).post('/api/records/upload').set(auth(token))
    for (let i = 0; i < 9; i++)
      req = req.attach('images', png, { filename: `p${i}.png`, contentType: 'image/png' })
    const res = await req.expect(400)
    expect(res.body.message).toMatch(/Quá nhiều ảnh/)
  })
})
