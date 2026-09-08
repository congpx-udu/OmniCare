import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/common'
import { LandingNavbar } from '@/components/landing'
import { MEDICAL_DISCLAIMER } from '@/constants'

/** Layout công khai: navbar cố định + nội dung + footer disclaimer */
export function LandingLayout() {
  return (
    <div className="bg-surface flex min-h-screen flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200 px-3 md:px-5">
        <div className="flex flex-col items-center gap-2 py-6 text-center text-xs text-neutral-500">
          <Logo variant="mark" className="h-8 opacity-80" />
          <p>{MEDICAL_DISCLAIMER}</p>
          <p>© {new Date().getFullYear()} OmniCare — Trợ lý Sức khỏe Toàn diện AI</p>
        </div>
      </footer>
    </div>
  )
}
