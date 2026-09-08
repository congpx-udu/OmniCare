import { Link } from 'react-router-dom'
import { MedicalDisclaimer } from '@/components/common'
import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'

const SHORTCUTS = [
  {
    to: ROUTES.CHAT,
    title: 'Chat sức khỏe',
    desc: 'Mô tả triệu chứng, nhận phân tích sơ bộ và gợi ý chuyên khoa.',
    accent: 'bg-secondary',
  },
  {
    to: ROUTES.OCR,
    title: 'Số hóa đơn thuốc',
    desc: 'Chụp đơn thuốc, bệnh án in máy để OCR và lưu hồ sơ.',
    accent: 'bg-tertiary',
  },
  {
    to: ROUTES.PROFILE,
    title: 'Hồ sơ sức khỏe',
    desc: 'Chiều cao, cân nặng, bệnh nền, dị ứng để AI cá nhân hóa lời khuyên.',
    accent: 'bg-primary',
  },
]

/** Trang đầu tiên sau đăng nhập. Giai đoạn 5 sẽ thêm nhắc thuốc, chỉ số, cảnh báo thời tiết. */
export function DashboardPage() {
  const { user } = useAuth()
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl">Xin chào, {user?.fullName ?? 'bạn'} 👋</h1>
        <p className="text-neutral-600">
          Trợ lý sức khỏe của bạn đã sẵn sàng. Chọn một tính năng để bắt đầu.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {SHORTCUTS.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group rounded-card bg-surface hover:border-primary-200 border border-neutral-200 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className={`mb-4 block h-1.5 w-10 rounded-full ${s.accent}`} />
            <h3 className="group-hover:text-secondary text-lg">{s.title}</h3>
            <p className="mt-1 text-sm text-neutral-600">{s.desc}</p>
          </Link>
        ))}
      </div>

      <MedicalDisclaimer />
    </section>
  )
}
