import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth } from '@/components/auth'
import { LazyPage } from '@/components/common'
import { ROUTES } from '@/constants'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LandingLayout } from '@/layouts/LandingLayout'
import { LandingPage } from '@/pages/landing/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import {
  ChatPage,
  DashboardPage,
  LoginPage,
  ProfilePage,
  RecordDetailPage,
  RecordsPage,
  RegisterPage,
  TrackingPage,
  WeatherPage,
} from '@/pages/lazy'

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
      {
        path: ROUTES.LOGIN,
        element: (
          <LazyPage>
            <LoginPage />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.REGISTER,
        element: (
          <LazyPage>
            <RegisterPage />
          </LazyPage>
        ),
      },
    ],
  },
  {
    // Khu vực ứng dụng: cần đăng nhập, sidebar trái
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: (
              <LazyPage>
                <DashboardPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.CHAT,
            element: (
              <LazyPage>
                <ChatPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.WEATHER,
            element: (
              <LazyPage>
                <WeatherPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.RECORDS,
            element: (
              <LazyPage>
                <RecordsPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.RECORD_DETAIL,
            element: (
              <LazyPage>
                <RecordDetailPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.TRACKING,
            element: (
              <LazyPage>
                <TrackingPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.PROFILE,
            element: (
              <LazyPage>
                <ProfilePage />
              </LazyPage>
            ),
          },
        ],
      },
    ],
  },
])
