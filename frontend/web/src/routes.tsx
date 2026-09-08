import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ChatPage } from '@/pages/chat/ChatPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { HomePage } from '@/pages/dashboard/HomePage'
import { ProfilePage } from '@/pages/health-profile/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OcrPage } from '@/pages/ocr/OcrPage'

export const router = createBrowserRouter([
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
  {
    element: <AuthLayout />,
    children: [{ path: ROUTES.LOGIN, element: <LoginPage /> }],
  },
])
