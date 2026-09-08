import { axiosClient, ENDPOINTS } from '@/api'
import type { User } from '@/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export const authService = {
  login: (payload: LoginPayload) =>
    axiosClient.post<LoginResponse, LoginResponse>(ENDPOINTS.AUTH.LOGIN, payload),
  me: () => axiosClient.get<User, User>(ENDPOINTS.AUTH.ME),
}
