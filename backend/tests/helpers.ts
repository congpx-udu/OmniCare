import request from 'supertest'

/** Import app sau khi setup.ts đã đặt env (import động để env.ts parse đúng) */
export async function getApp() {
  const { app } = await import('../src/app.js')
  return app
}

let counter = 0

/** Đăng ký + đăng nhập một user mới, trả token và phone */
export async function registerAndLogin(name = 'Người dùng test') {
  const fullName = name.length < 2 ? `Người dùng ${name}` : name
  const app = await getApp()
  const phone = `09${String(10000000 + ++counter).padStart(8, '0')}`
  const password = 'matkhau123'
  await request(app).post('/api/auth/register').send({ fullName, phone, password }).expect(201)
  const res = await request(app).post('/api/auth/login').send({ phone, password }).expect(200)
  return {
    app,
    token: res.body.data.token as string,
    phone,
    userId: res.body.data.user.id as string,
  }
}

export const auth = (token: string) => ({ Authorization: `Bearer ${token}` })
