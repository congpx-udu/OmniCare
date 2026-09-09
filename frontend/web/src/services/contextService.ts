import { axiosClient, ENDPOINTS } from '@/api'
import type { ApiResponse, WeatherInsight, WeatherLocationQuery, WeatherSnapshot } from '@/types'

export const contextService = {
  weather: (query: WeatherLocationQuery) =>
    axiosClient.get<ApiResponse<WeatherSnapshot>, ApiResponse<WeatherSnapshot>>(
      ENDPOINTS.CONTEXT.WEATHER,
      { params: query },
    ),
  /** Gọi LLM nên timeout dài hơn mặc định */
  weatherInsight: (query: WeatherLocationQuery) =>
    axiosClient.get<ApiResponse<WeatherInsight>, ApiResponse<WeatherInsight>>(
      ENDPOINTS.CONTEXT.WEATHER_INSIGHT,
      { params: query, timeout: 75_000 },
    ),
}
