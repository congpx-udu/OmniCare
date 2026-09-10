import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { auth, registerAndLogin } from './helpers.js'

describe('profile', () => {
  it('trả hồ sơ rỗng kèm tài khoản, upsert tính tuổi, cân nặng/BMI lấy từ nhật ký, null xóa trường, tag trùng bị loại', async () => {
    const { app, token } = await registerAndLogin()
    const empty = await request(app).get('/api/profile').set(auth(token)).expect(200)
    expect(empty.body.data).toMatchObject({
      heightCm: null,
      weightKg: null,
      bmi: null,
      isComplete: false,
    })
    expect(empty.body.data.fullName).toBeTruthy()
    expect(empty.body.data.phone).toBeTruthy()

    const put = await request(app)
      .put('/api/profile')
      .set(auth(token))
      .send({
        fullName: 'Nguyễn Văn Test',
        heightCm: 170,
        dateOfBirth: '1995-03-15',
        gender: 'male',
        chronicConditions: ['Tiểu đường', 'tiểu đường', 'Cao huyết áp'],
        allergies: ['Hải sản'],
      })
      .expect(200)
    expect(put.body.data.fullName).toBe('Nguyễn Văn Test')
    expect(put.body.data.age).toBeGreaterThanOrEqual(31)
    expect(put.body.data.isComplete).toBe(true)
    expect(put.body.data.bmi).toBeNull()
    expect(put.body.data.chronicConditions).toEqual(['Tiểu đường', 'Cao huyết áp'])

    // Tên mới cũng phản ánh ở /auth/me
    const me = await request(app).get('/api/auth/me').set(auth(token)).expect(200)
    expect(me.body.data.fullName).toBe('Nguyễn Văn Test')

    // Cân nặng ghi trong nhật ký → hồ sơ lấy bản mới nhất theo ngày và tính BMI
    await request(app)
      .put('/api/tracking/logs/2026-09-01')
      .set(auth(token))
      .send({ weightKg: 70 })
      .expect(200)
    await request(app)
      .put('/api/tracking/logs/2026-09-05')
      .set(auth(token))
      .send({ weightKg: 65.5 })
      .expect(200)
    const withWeight = await request(app).get('/api/profile').set(auth(token)).expect(200)
    expect(withWeight.body.data.weightKg).toBe(65.5)
    expect(withWeight.body.data.weightDate).toBe('2026-09-05')
    expect(withWeight.body.data.bmi).toBe(22.7)

    const unset = await request(app)
      .put('/api/profile')
      .set(auth(token))
      .send({ heightCm: null })
      .expect(200)
    expect(unset.body.data.heightCm).toBeNull()
    expect(unset.body.data.bmi).toBeNull()
    expect(unset.body.data.isComplete).toBe(false)
  })

  it('từ chối dữ liệu sai, email trùng, và không cho user khác đọc', async () => {
    const a = await registerAndLogin('A')
    const b = await registerAndLogin('B')
    await request(a.app).put('/api/profile').set(auth(a.token)).send({ heightCm: 10 }).expect(400)
    await request(a.app).put('/api/profile').set(auth(a.token)).send({ gender: 'x' }).expect(400)
    await request(a.app).put('/api/profile').set(auth(a.token)).send({ fullName: 'A' }).expect(400)
    await request(a.app)
      .put('/api/profile')
      .set(auth(a.token))
      .send({ email: 'not-an-email' })
      .expect(400)
    await request(a.app)
      .put('/api/profile')
      .set(auth(a.token))
      .send({ email: 'dup@example.com', heightCm: 180 })
      .expect(200)
    await request(b.app)
      .put('/api/profile')
      .set(auth(b.token))
      .send({ email: 'dup@example.com' })
      .expect(409)
    const other = await request(b.app).get('/api/profile').set(auth(b.token)).expect(200)
    expect(other.body.data.heightCm).toBeNull()
  })
})
