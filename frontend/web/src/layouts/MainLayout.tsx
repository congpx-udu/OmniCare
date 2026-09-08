import { Link, Outlet } from 'react-router-dom'
import { APP_NAME, MEDICAL_DISCLAIMER, ROUTES } from '@/constants'

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-white px-6 py-3">
        <Link to={ROUTES.HOME} className="text-lg font-semibold text-primary">
          {APP_NAME}
        </Link>
        <nav className="flex gap-4 text-sm text-gray-600">
          <Link to={ROUTES.CHAT}>Chat</Link>
          <Link to={ROUTES.OCR}>OCR</Link>
          <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
        </nav>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      <footer className="border-t bg-white px-6 py-2 text-xs text-gray-500">
        {MEDICAL_DISCLAIMER}
      </footer>
    </div>
  )
}
