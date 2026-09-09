import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { signToken } from '../utils/jwt.js'
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js'

interface PublicUserSource {
  _id: unknown
  phone: string
  email?: string | null
  fullName: string
}

function toPublicUser(user: PublicUserSource) {
  return {
    id: String(user._id),
    phone: user.phone,
    email: user.email ?? null,
    fullName: user.fullName,
  }
}

/** Tạo tài khoản. Không trả token: sau khi đăng ký người dùng quay về trang đăng nhập. */
export async function register(input: RegisterInput) {
  const exists = await User.exists({ phone: input.phone })
  if (exists) throw ApiError.conflict('Số điện thoại đã được đăng ký')
  if (input.email) {
    const emailTaken = await User.exists({ email: input.email })
    if (emailTaken) throw ApiError.conflict('Email đã được đăng ký')
  }
  const password = await bcrypt.hash(input.password, 10)
  const user = await User.create({ ...input, password })
  return { user: toPublicUser(user) }
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ phone: input.phone }).select('+password')
  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    throw ApiError.unauthorized('Số điện thoại hoặc mật khẩu không đúng')
  }
  return { token: signToken(String(user._id)), user: toPublicUser(user) }
}

export async function me(userId: string) {
  const user = await User.findById(userId)
  if (!user) throw ApiError.notFound('Không tìm thấy người dùng')
  return toPublicUser(user)
}
