export const ENDPOINTS = {
  AUTH: { LOGIN: '/auth/login', REGISTER: '/auth/register', ME: '/auth/me' },
  CHAT: { SEND: '/chat', HISTORY: '/chat/history' },
  OCR: { UPLOAD: '/ocr/upload', RESULT: (id: string) => `/ocr/${id}` },
  PROFILE: { GET: '/profile', UPDATE: '/profile' },
  CONTEXT: { WEATHER: '/context/weather' },
} as const
