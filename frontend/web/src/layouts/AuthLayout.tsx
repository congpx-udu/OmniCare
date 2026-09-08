import { Outlet } from 'react-router-dom'
import { APP_NAME } from '@/constants'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-light">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-center text-xl font-bold text-primary">{APP_NAME}</h1>
        <Outlet />
      </div>
    </div>
  )
}
