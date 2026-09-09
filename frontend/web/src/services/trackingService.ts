import { axiosClient, ENDPOINTS } from '@/api'
import type {
  ActivityType,
  ApiResponse,
  HealthAdvice,
  HealthLog,
  WeatherLocationQuery,
} from '@/types'

/** Body PUT /tracking/logs/:date; undefined giữ nguyên, null xóa chỉ số */
export interface UpsertLogPayload {
  weightKg?: number | null
  systolic?: number | null
  diastolic?: number | null
  heartRate?: number | null
  glucose?: number | null
  sleepHours?: number | null
  activityMinutes?: number | null
  activityType?: ActivityType | null
  mood?: number | null
  note?: string | null
}

const AI_TIMEOUT_MS = 75_000

export const trackingService = {
  logs: (params: { from?: string; to?: string; limit?: number } = {}) =>
    axiosClient.get<ApiResponse<HealthLog[]>, ApiResponse<HealthLog[]>>(ENDPOINTS.TRACKING.LOGS, {
      params,
    }),
  upsertLog: (date: string, payload: UpsertLogPayload) =>
    axiosClient.put<ApiResponse<HealthLog>, ApiResponse<HealthLog>>(
      ENDPOINTS.TRACKING.LOG(date),
      payload,
    ),
  deleteLog: (date: string) =>
    axiosClient.delete<ApiResponse<{ deleted: boolean }>, ApiResponse<{ deleted: boolean }>>(
      ENDPOINTS.TRACKING.LOG(date),
    ),
  analyze: (payload: { days?: number; location?: WeatherLocationQuery }) =>
    axiosClient.post<ApiResponse<HealthAdvice>, ApiResponse<HealthAdvice>>(
      ENDPOINTS.TRACKING.ANALYZE,
      payload,
      { timeout: AI_TIMEOUT_MS },
    ),
  advice: (limit = 5) =>
    axiosClient.get<ApiResponse<HealthAdvice[]>, ApiResponse<HealthAdvice[]>>(
      ENDPOINTS.TRACKING.ADVICE,
      { params: { limit } },
    ),
  suggestionDone: (id: string, index: number, done: boolean) =>
    axiosClient.patch<ApiResponse<HealthAdvice>, ApiResponse<HealthAdvice>>(
      ENDPOINTS.TRACKING.SUGGESTION(id, index),
      { done },
    ),
}
