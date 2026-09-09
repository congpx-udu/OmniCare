import { axiosClient, ENDPOINTS } from '@/api'
import type { ApiResponse, User } from '@/types'

export interface LoginPayload {
  phone: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  phone: string
  password: string
  email?: string
}

export interface LoginResult {
  token: string
  user: User
}

// axiosClient interceptor đã unwrap res.data nên kiểu trả về là ApiResponse<T>
export const authService = {
  login: (payload: LoginPayload) =>
    axiosClient.post<ApiResponse<LoginResult>, ApiResponse<LoginResult>>(
      ENDPOINTS.AUTH.LOGIN,
      payload,
    ),
  register: (payload: RegisterPayload) =>
    axiosClient.post<ApiResponse<{ user: User }>, ApiResponse<{ user: User }>>(
      ENDPOINTS.AUTH.REGISTER,
      payload,
    ),
  me: () => axiosClient.get<ApiResponse<User>, ApiResponse<User>>(ENDPOINTS.AUTH.ME),
}
