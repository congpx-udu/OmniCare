import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'

export interface JwtPayload {
  sub: string
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}
