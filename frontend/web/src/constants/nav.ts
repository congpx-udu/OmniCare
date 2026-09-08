import { ROUTES } from './routes'

export type AppNavIcon = 'home' | 'chat' | 'scan' | 'profile'

/** Điều hướng sidebar khu vực ứng dụng (sau đăng nhập) */
export const APP_NAV: ReadonlyArray<{ to: string; label: string; icon: AppNavIcon }> = [
  { to: ROUTES.DASHBOARD, label: 'Tổng quan', icon: 'home' },
  { to: ROUTES.CHAT, label: 'Chat sức khỏe', icon: 'chat' },
  { to: ROUTES.OCR, label: 'Hồ sơ OCR', icon: 'scan' },
  { to: ROUTES.PROFILE, label: 'Hồ sơ sức khỏe', icon: 'profile' },
]

/** Menu ngang landing page (anchor tới các section) */
export const LANDING_NAV = [
  { href: '#features', label: 'Tính năng' },
  { href: '#how-it-works', label: 'Cách hoạt động' },
  { href: '#personas', label: 'Dành cho ai' },
] as const
