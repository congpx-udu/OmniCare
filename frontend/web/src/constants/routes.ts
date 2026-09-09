export const ROUTES = {
  /** Landing page công khai, menu ngang */
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  /** Trang đầu tiên sau khi đăng nhập (khu vực ứng dụng, sidebar trái) */
  DASHBOARD: '/dashboard',
  CHAT: '/chat',
  /** Thời tiết & vị trí */
  WEATHER: '/weather',
  /** Hồ sơ bệnh án (upload + OCR) */
  RECORDS: '/records',
  RECORD_DETAIL: '/records/:id',
  PROFILE: '/profile',
} as const
