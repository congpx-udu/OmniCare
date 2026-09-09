import { ROUTES } from './routes'

export type AppNavIcon = 'home' | 'chat' | 'scan' | 'profile' | 'weather' | 'activity'

/** Điều hướng sidebar khu vực ứng dụng (sau đăng nhập) */
export const APP_NAV: ReadonlyArray<{ to: string; label: string; icon: AppNavIcon }> = [
  { to: ROUTES.DASHBOARD, label: 'Tổng quan', icon: 'home' },
  { to: ROUTES.WEATHER, label: 'Thời tiết', icon: 'weather' },
  { to: ROUTES.CHAT, label: 'Trợ lý AI', icon: 'chat' },
  { to: ROUTES.RECORDS, label: 'Hồ sơ bệnh án', icon: 'scan' },
  { to: ROUTES.TRACKING, label: 'Theo dõi sức khỏe', icon: 'activity' },
  { to: ROUTES.PROFILE, label: 'Hồ sơ sức khỏe', icon: 'profile' },
]
