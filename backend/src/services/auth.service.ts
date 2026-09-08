import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { signToken } from '../utils/jwt.js'
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js'

function toPublicUser(user: { _id: unknown; email: string; fullName: string }) {
  return { id: String(user._id), email: user.email, fullName: user.fullName }
}

export async function register(input: RegisterInput) {
  const exists = await User.exists({ email: input.email })
  if (exists) throw ApiError.conflict('Email đã được đăng ký')
  const password = await bcrypt.hash(input.password, 10)
  const user = await User.create({ ...input, password })
  return { token: signToken(String(user._id)), user: toPublicUser(user) }
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select('+password')
  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    throw ApiError.unauthorized('Email hoặc mật khẩu không đúng')
  }
  return { token: signToken(String(user._id)), user: toPublicUser(user) }
}

export async function me(userId: string) {
  const user = await User.findById(userId)
  if (!user) throw ApiError.notFound('Không tìm thấy người dùng')
  return toPublicUser(user)
}
