import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth } from '@/components/auth'
import { ROUTES } from '@/constants'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LandingLayout } from '@/layouts/LandingLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ChatPage } from '@/pages/chat/ChatPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ProfilePage } from '@/pages/health-profile/ProfilePage'
import { LandingPage } from '@/pages/landing/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OcrPage } from '@/pages/ocr/OcrPage'

export const router = createBrowserRouter([
  {
    // Công khai: landing page với menu ngang
    element: <LandingLayout />,
    children: [
      { path: ROUTES.HOME, element: <LandingPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    // Đăng nhập / đăng ký
    element: <AuthLayout />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
    ],
  },
  {
    // Khu vực ứng dụng: cần đăng nhập, sidebar trái
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.CHAT, element: <ChatPage /> },
          { path: ROUTES.OCR, element: <OcrPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> },
        ],
      },
    ],
  },
])
