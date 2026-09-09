export const ENDPOINTS = {
  AUTH: { LOGIN: '/auth/login', REGISTER: '/auth/register', ME: '/auth/me' },
  CHAT: { SEND: '/chat', HISTORY: '/chat/history' },
  RECORDS: {
    LIST: '/records',
    UPLOAD: '/records/upload',
    DETAIL: (id: string) => `/records/${id}`,
    IMAGE: (id: string, page = 0) => `/records/${id}/image/${page}`,
    REPROCESS: (id: string) => `/records/${id}/reprocess`,
  },
  PROFILE: { GET: '/profile', UPDATE: '/profile' },
  CONTEXT: { WEATHER: '/context/weather', WEATHER_INSIGHT: '/context/weather/insight' },
} as const
