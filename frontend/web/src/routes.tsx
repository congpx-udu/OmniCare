import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth } from '@/components/auth'
import { ROUTES } from '@/constants'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ChatPage } from '@/pages/chat/ChatPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { HomePage } from '@/pages/dashboard/HomePage'
import { ProfilePage } from '@/pages/health-profile/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OcrPage } from '@/pages/ocr/OcrPage'

export const router = createBrowserRouter([
  {
    // Mọi trang chính cần đăng nhập
    element: <RequireAuth />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: ROUTES.HOME, element: <HomePage /> },
          { path: ROUTES.CHAT, element: <ChatPage /> },
          { path: ROUTES.OCR, element: <OcrPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> },
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
    ],
  },
])
