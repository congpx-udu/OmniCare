import { ROUTES } from './routes'

export type AppNavIcon = 'home' | 'chat' | 'scan' | 'profile'

/** Điều hướng sidebar khu vực ứng dụng (sau đăng nhập) */
export const APP_NAV: ReadonlyArray<{ to: string; label: string; icon: AppNavIcon }> = [
  { to: ROUTES.DASHBOARD, label: 'Tổng quan', icon: 'home' },
  { to: ROUTES.CHAT, label: 'Chat sức khỏe', icon: 'chat' },
  { to: ROUTES.RECORDS, label: 'Hồ sơ bệnh án', icon: 'scan' },
  { to: ROUTES.PROFILE, label: 'Hồ sơ sức khỏe', icon: 'profile' },
]
