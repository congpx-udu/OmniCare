import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/common'
import { MEDICAL_DISCLAIMER } from '@/constants'

const HIGHLIGHTS = [
  {
    title: 'Phân tích triệu chứng sơ bộ',
    desc: 'Chatbot AI gợi ý hướng xử lý và chuyên khoa phù hợp.',
  },
  {
    title: 'Số hóa đơn thuốc, bệnh án',
    desc: 'Chụp ảnh, OCR tự động bóc tách và lưu thành hồ sơ.',
  },
  {
    title: 'Gợi ý theo bối cảnh',
    desc: 'Thực đơn, vận động theo thời tiết, vị trí và cảm nhận của bạn.',
  },
]

/** Khung 2 cột cho login/register: trái là thương hiệu, phải là form */
export function AuthLayout() {
  return (
    <div className="bg-background grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="bg-primary relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="bg-secondary/30 pointer-events-none absolute -top-32 -right-32 size-[28rem] rounded-full blur-3xl"
        />
        <div
          aria-hidden
          className="bg-tertiary/25 pointer-events-none absolute -bottom-40 -left-24 size-[26rem] rounded-full blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <Logo variant="mark" className="h-12 rounded-xl bg-white p-1.5" />
          <div>
            <p className="font-heading text-lg font-bold">OmniCare</p>
            <p className="text-primary-200 text-xs">Trợ lý Sức khỏe Toàn diện AI</p>
          </div>
        </div>

        <div className="relative space-y-8">
          <h2 className="font-heading text-4xl leading-tight font-extrabold text-white">
            Chăm sóc sức khỏe
            <br />
            <span className="text-secondary-300">chủ động</span>, mỗi ngày.
          </h2>
          <ul className="space-y-4">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex gap-3">
                <span className="bg-secondary mt-1 flex size-6 shrink-0 items-center justify-center rounded-full text-white">
                  <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <p className="font-heading font-semibold">{h.title}</p>
                  <p className="text-primary-200 text-sm">{h.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-primary-300 relative text-xs">{MEDICAL_DISCLAIMER}</p>
      </aside>

      <main className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="mb-8 lg:hidden">
          <Logo variant="full" className="h-14" />
        </div>
        <div className="rounded-card bg-surface w-full max-w-md p-6 shadow-[0_12px_40px_-16px_rgba(11,37,69,0.25)] sm:p-8">
          <Outlet />
        </div>
        <p className="mt-6 max-w-md text-center text-xs text-neutral-500 lg:hidden">
          {MEDICAL_DISCLAIMER}
        </p>
      </main>
    </div>
  )
}
