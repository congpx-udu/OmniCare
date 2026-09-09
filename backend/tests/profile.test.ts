import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { auth, registerAndLogin } from './helpers.js'

describe('profile', () => {
  it('trả hồ sơ rỗng, upsert tính BMI/tuổi, null xóa trường, tag trùng bị loại', async () => {
    const { app, token } = await registerAndLogin()
    const empty = await request(app).get('/api/profile').set(auth(token)).expect(200)
    expect(empty.body.data).toMatchObject({ heightCm: null, bmi: null, isComplete: false })

    const put = await request(app)
      .put('/api/profile')
      .set(auth(token))
      .send({
        heightCm: 170,
        weightKg: 65.5,
        dateOfBirth: '1995-03-15',
        gender: 'male',
        chronicConditions: ['Tiểu đường', 'tiểu đường', 'Cao huyết áp'],
        allergies: ['Hải sản'],
      })
      .expect(200)
    expect(put.body.data.bmi).toBe(22.7)
    expect(put.body.data.age).toBeGreaterThanOrEqual(31)
    expect(put.body.data.isComplete).toBe(true)
    expect(put.body.data.chronicConditions).toEqual(['Tiểu đường', 'Cao huyết áp'])

    const unset = await request(app)
      .put('/api/profile')
      .set(auth(token))
      .send({ weightKg: null })
      .expect(200)
    expect(unset.body.data.weightKg).toBeNull()
    expect(unset.body.data.bmi).toBeNull()
    expect(unset.body.data.heightCm).toBe(170)
  })

  it('từ chối dữ liệu sai và không cho user khác đọc', async () => {
    const a = await registerAndLogin('A')
    const b = await registerAndLogin('B')
    await request(a.app).put('/api/profile').set(auth(a.token)).send({ heightCm: 10 }).expect(400)
    await request(a.app).put('/api/profile').set(auth(a.token)).send({ gender: 'x' }).expect(400)
    await request(a.app).put('/api/profile').set(auth(a.token)).send({ heightCm: 180 }).expect(200)
    const other = await request(b.app).get('/api/profile').set(auth(b.token)).expect(200)
    expect(other.body.data.heightCm).toBeNull()
  })
})
