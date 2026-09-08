import { Link } from 'react-router-dom'
import logoMark from '@/assets/logo.png'
import { Button } from '@/components/common'
import { NavIcon, type NavIconName } from '@/components/layout'
import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'

const FEATURES: Array<{ icon: NavIconName; title: string; desc: string; accent: string }> = [
  {
    icon: 'chat',
    title: 'Chatbot phân tích triệu chứng',
    desc: 'Mô tả cảm giác của bạn, AI đưa ra phân tích sơ bộ, mức độ cần lưu ý và chuyên khoa nên khám.',
    accent: 'bg-secondary-50 text-secondary-700',
  },
  {
    icon: 'scan',
    title: 'Số hóa đơn thuốc, bệnh án',
    desc: 'Chụp đơn thuốc in máy, OCR tự động bóc tách tên thuốc, chẩn đoán và lưu thành timeline gọn gàng.',
    accent: 'bg-tertiary-50 text-tertiary-700',
  },
  {
    icon: 'home',
    title: 'Gợi ý theo bối cảnh',
    desc: 'Thực đơn và bài tập thay đổi theo thời tiết, vị trí, cảm nhận hôm nay và lịch sử bệnh của bạn.',
    accent: 'bg-primary-50 text-primary',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Kể cho OmniCare nghe',
    desc: 'Nhập triệu chứng hoặc cảm nhận. Cho phép vị trí để lấy thời tiết tại chỗ.',
  },
  {
    n: '02',
    title: 'AI phân tích',
    desc: 'Kết hợp triệu chứng, thời tiết và hồ sơ sức khỏe để đưa ra hướng xử lý sơ bộ.',
  },
  {
    n: '03',
    title: 'Nhận kế hoạch trong ngày',
    desc: 'Thực đơn, vận động, nhắc thuốc. Luôn kèm lời khuyên gặp bác sĩ khi cần.',
  },
]

const PERSONAS = [
  {
    title: 'Người làm việc trí óc',
    desc: 'Ngồi nhiều, mỏi vai gáy, giờ giấc thất thường. Cần bài tập tại chỗ và bữa ăn nhanh, lành mạnh.',
  },
  {
    title: 'Quản lý sức khỏe gia đình',
    desc: 'Nhiều đơn thuốc, sổ khám. Cần số hóa hồ sơ, nhắc uống thuốc và cảnh báo khi chuyển mùa.',
  },
  {
    title: 'Người sống linh hoạt',
    desc: 'Hay di chuyển, năng lượng thay đổi. Cần gợi ý phù hợp với nơi đang ở và cảm xúc hiện tại.',
  },
]

export function LandingPage() {
  const { isAuthenticated } = useAuth()
  const primaryCta = isAuthenticated ? (
    <Link to={ROUTES.DASHBOARD}>
      <Button size="lg">Vào ứng dụng</Button>
    </Link>
  ) : (
    <Link to={ROUTES.REGISTER}>
      <Button size="lg">Bắt đầu miễn phí</Button>
    </Link>
  )

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="bg-secondary/15 pointer-events-none absolute -top-40 right-0 size-[32rem] rounded-full blur-3xl"
        />
        <div
          aria-hidden
          className="bg-tertiary/15 pointer-events-none absolute -bottom-40 -left-20 size-[28rem] rounded-full blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:py-24">
          <div className="space-y-6">
            <span className="bg-secondary-50 text-secondary-700 font-heading inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
              <span className="bg-secondary size-1.5 rounded-full" />
              Trợ lý Sức khỏe Toàn diện AI
            </span>
            <h1 className="text-4xl leading-tight sm:text-5xl">
              Chăm sóc sức khỏe <span className="text-secondary">chủ động</span>,<br />
              đúng với bối cảnh của bạn.
            </h1>
            <p className="max-w-xl text-lg text-neutral-600">
              Một trợ lý duy nhất thay cho nhiều ứng dụng rời rạc: phân tích triệu chứng sơ bộ, số
              hóa hồ sơ y tế và gợi ý thực đơn, vận động theo thời tiết, vị trí và cảm nhận mỗi
              ngày.
            </p>
            <div className="flex flex-wrap gap-3">
              {primaryCta}
              <a href="#how-it-works">
                <Button variant="outline" size="lg">
                  Xem cách hoạt động
                </Button>
              </a>
            </div>
            <p className="text-xs text-neutral-500">
              OmniCare không thay thế chẩn đoán y khoa. Hãy gặp bác sĩ khi có triệu chứng nghiêm
              trọng.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="rounded-card bg-surface border border-neutral-200 p-6 shadow-[0_24px_60px_-24px_rgba(11,37,69,0.35)]">
              <div className="mb-4 flex items-center gap-3">
                <img src={logoMark} alt="" className="h-10" />
                <div>
                  <p className="font-heading text-primary text-sm font-bold">OmniCare</p>
                  <p className="text-xs text-neutral-500">Hà Nội · 31°C · Nắng nóng</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="bg-surface-muted ml-8 rounded-2xl rounded-tr-sm px-3 py-2 text-neutral-800">
                  Hôm nay tôi hơi uể oải và đau đầu nhẹ.
                </div>
                <div className="bg-primary mr-8 rounded-2xl rounded-tl-sm px-3 py-2 text-white">
                  Có thể do nắng nóng và thiếu nước. Hãy uống thêm nước, nghỉ mắt 10 phút. Gợi ý bữa
                  trưa: canh chua cá, rau luộc. Nếu đau đầu kéo dài hơn 2 ngày, bạn nên đi khám.
                </div>
              </div>
              <p className="mt-4 text-[11px] text-neutral-500">Không thay thế chẩn đoán y khoa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-surface scroll-mt-16 border-y border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl">Mọi thứ trong một trợ lý</h2>
            <p className="mt-2 text-neutral-600">
              Không cần một app để tra triệu chứng, một app xem thời tiết, một app đếm calo.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-card bg-background border border-neutral-200 p-6"
              >
                <span
                  className={`mb-4 inline-flex size-11 items-center justify-center rounded-xl ${f.accent}`}
                >
                  <NavIcon name={f.icon} className="size-6" />
                </span>
                <h3 className="text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="mb-10 text-3xl">Cách hoạt động</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="relative">
                <span className="font-heading text-secondary-200 text-5xl font-extrabold">
                  {s.n}
                </span>
                <h3 className="mt-2 text-lg">{s.title}</h3>
                <p className="mt-1 text-sm text-neutral-600">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Personas */}
      <section id="personas" className="bg-primary scroll-mt-16 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="mb-10 text-3xl text-white">Dành cho ai</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {PERSONAS.map((p) => (
              <div key={p.title} className="rounded-card border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg text-white">{p.title}</h3>
                <p className="text-primary-200 mt-2 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <p className="text-primary-100 max-w-xl">
              Tạo tài khoản bằng số điện thoại, chưa đến một phút. Miễn phí trong giai đoạn thử
              nghiệm.
            </p>
            {isAuthenticated ? (
              <Link to={ROUTES.DASHBOARD}>
                <Button variant="inverted" size="lg">
                  Vào ứng dụng
                </Button>
              </Link>
            ) : (
              <Link to={ROUTES.REGISTER}>
                <Button variant="inverted" size="lg">
                  Đăng ký ngay
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
