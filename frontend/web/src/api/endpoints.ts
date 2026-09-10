export const ENDPOINTS = {
  AUTH: { LOGIN: '/auth/login', REGISTER: '/auth/register', ME: '/auth/me' },
  CHAT: {
    SEND: '/chat',
    HISTORY: '/chat/history',
    IMAGE: (id: string, index: number) => `/chat/${id}/image/${index}`,
  },
  RECORDS: {
    LIST: '/records',
    UPLOAD: '/records/upload',
    DETAIL: (id: string) => `/records/${id}`,
    IMAGE: (id: string, page = 0) => `/records/${id}/image/${page}`,
    REPROCESS: (id: string) => `/records/${id}/reprocess`,
  },
  PROFILE: { GET: '/profile', UPDATE: '/profile' },
  TRACKING: {
    LOGS: '/tracking/logs',
    LOG: (date: string) => `/tracking/logs/${date}`,
    ANALYZE: '/tracking/analyze',
    ADVICE: '/tracking/advice',
    SUGGESTION: (id: string, index: number) => `/tracking/advice/${id}/suggestions/${index}`,
  },
  CONTEXT: { WEATHER: '/context/weather', WEATHER_INSIGHT: '/context/weather/insight' },
} as const
