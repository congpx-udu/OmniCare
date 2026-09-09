import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { auth, getApp, registerAndLogin } from './helpers.js'

describe('auth', () => {
  it('đăng ký, đăng nhập bằng SĐT (chuẩn hóa +84), /me trả user không có password', async () => {
    const app = await getApp()
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'An', phone: '+84 912 000 999', password: 'matkhau123' })
      .expect(201)
    expect(reg.body.data.user.phone).toBe('0912000999')
    expect(reg.body.data.token).toBeUndefined()

    const login = await request(app)
      .post('/api/auth/login')
      .send({ phone: '0912000999', password: 'matkhau123' })
      .expect(200)
    expect(login.body.data.token).toBeTypeOf('string')

    const me = await request(app).get('/api/auth/me').set(auth(login.body.data.token)).expect(200)
    expect(me.body.data).toMatchObject({ phone: '0912000999', fullName: 'An' })
    expect(me.body.data.password).toBeUndefined()
  })

  it('từ chối SĐT trùng, mật khẩu sai, token sai', async () => {
    const { app, phone } = await registerAndLogin()
    await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Bình', phone, password: 'matkhau123' })
      .expect(409)
    await request(app).post('/api/auth/login').send({ phone, password: 'sai-roi' }).expect(401)
    await request(app).get('/api/auth/me').set(auth('abc.def.ghi')).expect(401)
    await request(app).get('/api/auth/me').expect(401)
  })

  it('validate body: SĐT không hợp lệ, mật khẩu ngắn', async () => {
    const app = await getApp()
    const res = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'A', phone: '123', password: '1' })
      .expect(400)
    expect(res.body.success).toBe(false)
    expect(res.body.details.length).toBeGreaterThan(0)
  })
})
