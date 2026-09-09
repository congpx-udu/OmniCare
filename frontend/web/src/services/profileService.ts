import { axiosClient, ENDPOINTS } from '@/api'
import type { ApiResponse, HealthProfile } from '@/types'

/** Body PUT /profile: trường không gửi giữ nguyên, null = xóa giá trị */
export interface UpdateProfilePayload {
  heightCm?: number | null
  weightKg?: number | null
  dateOfBirth?: string | null
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
