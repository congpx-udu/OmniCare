import { axiosClient, ENDPOINTS } from '@/api'
import type { ApiResponse, WeatherLocationQuery, WeatherSnapshot } from '@/types'

export const contextService = {
  weather: (query: WeatherLocationQuery) =>
    axiosClient.get<ApiResponse<WeatherSnapshot>, ApiResponse<WeatherSnapshot>>(
      ENDPOINTS.CONTEXT.WEATHER,
      { params: query },
    ),
}
