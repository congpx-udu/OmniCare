import { axiosClient, ENDPOINTS } from '@/api'
import type { ApiResponse, Gender, HealthProfile } from '@/types'

/** Body PUT /profile: trường không gửi giữ nguyên, null = xóa giá trị */
export interface UpdateProfilePayload {
  fullName?: string
  email?: string | null
  heightCm?: number | null
  dateOfBirth?: string | null
  gender?: Gender | null
  chronicConditions?: string[]
  allergies?: string[]
}

export const profileService = {
  get: () =>
    axiosClient.get<ApiResponse<HealthProfile>, ApiResponse<HealthProfile>>(ENDPOINTS.PROFILE.GET),
  update: (payload: UpdateProfilePayload) =>
    axiosClient.put<ApiResponse<HealthProfile>, ApiResponse<HealthProfile>>(
      ENDPOINTS.PROFILE.UPDATE,
      payload,
    ),
}
