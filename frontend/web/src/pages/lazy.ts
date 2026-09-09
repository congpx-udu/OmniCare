import { lazy } from 'react'

// Trang ứng dụng tách chunk riêng (lazy) để landing/login tải nhanh; landing giữ eager vì là trang đầu
export const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
)
export const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
export const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
export const ChatPage = lazy(() =>
  import('@/pages/chat/ChatPage').then((m) => ({ default: m.ChatPage })),
)
export const WeatherPage = lazy(() =>
  import('@/pages/weather/WeatherPage').then((m) => ({ default: m.WeatherPage })),
)
export const RecordsPage = lazy(() =>
  import('@/pages/records/RecordsPage').then((m) => ({ default: m.RecordsPage })),
)
export const RecordDetailPage = lazy(() =>
  import('@/pages/records/RecordDetailPage').then((m) => ({ default: m.RecordDetailPage })),
)
export const TrackingPage = lazy(() =>
  import('@/pages/tracking/TrackingPage').then((m) => ({ default: m.TrackingPage })),
)
export const ProfilePage = lazy(() =>
  import('@/pages/health-profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
