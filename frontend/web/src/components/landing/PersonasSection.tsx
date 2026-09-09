import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { LANDING_IMAGES, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { useStaggeredReveal } from '@/hooks/useStaggeredReveal'
import { staggerStyle } from '@/utils'
import { ArrowIcon } from './ArrowIcon'

/** Màn 3: "Dành cho ai" — card nền đặc + ảnh thường, không dùng masked cards */
export function PersonasSection() {
  const { isAuthenticated } = useAuth()
  const sectionRef = useRef<HTMLElement | null>(null)
  const visible = useStaggeredReveal(sectionRef)
  const ctaTo = isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER
  const ctaLabel = isAuthenticated ? 'Vào ứng dụng' : 'Đăng ký ngay'

  return (
    <section
      id="personas"
      ref={sectionRef}
      className="flex min-h-screen w-full flex-col gap-1.5 overflow-hidden px-3 pt-16 pb-1.5 md:h-screen md:gap-2 md:px-5 md:pt-20 md:pb-2"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-1.5 md:grid-cols-2 md:gap-2">
        {/* Cột trái */}
        <div className="flex flex-col gap-1.5 md:gap-2">
          <div
            className="bg-primary-50 flex min-h-[180px] flex-[1.2] flex-col justify-between rounded-xl p-5 md:min-h-0 md:rounded-2xl md:p-7"
            style={staggerStyle(visible, 0)}
          >
            <h2 className="font-heading text-primary text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] font-bold">
              Dành
              <br />
              cho ai
            </h2>
            <p className="text-primary text-xs font-semibold md:text-sm">
              Ba nhóm người dùng OmniCare được thiết kế cho
            </p>
          </div>

          <div
            className="flex min-h-[140px] flex-1 gap-1.5 md:min-h-0 md:gap-2"
            style={staggerStyle(visible, 1)}
          >
            <div className="flex-1 overflow-hidden rounded-xl md:rounded-2xl">
              <img
                src={LANDING_IMAGES.persona1}
                alt="Người làm việc trí óc"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 overflow-hidden rounded-xl md:rounded-2xl">
              <img
                src={LANDING_IMAGES.persona2}
                alt="Quản lý sức khỏe gia đình"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div
            className="bg-surface-muted flex min-h-[160px] flex-[0.8] items-end justify-between rounded-xl p-5 md:min-h-0 md:rounded-2xl md:p-7"
            style={staggerStyle(visible, 2)}
          >
            <div>
              <p className="text-primary mb-2 text-xs font-semibold md:mb-3 md:text-sm">
                Người sống linh hoạt
              </p>
              <h3 className="font-heading text-primary text-xl leading-6 font-bold md:text-3xl md:leading-8">
                Gợi ý theo
                <br />
                nơi bạn đang ở
                <br />
                và cảm xúc hôm nay
              </h3>
            </div>
            <Link
              to={ctaTo}
              className="bg-surface text-primary font-heading shrink-0 rounded-full px-5 py-3 text-base font-bold transition-transform hover:scale-105 md:px-8 md:py-5 md:text-xl"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>

        {/* Cột phải: ảnh cao + 2 card đè */}
        <div
          className="relative min-h-[350px] overflow-hidden rounded-xl md:min-h-0 md:rounded-2xl"
          style={staggerStyle(visible, 3)}
        >
          <img
            src={LANDING_IMAGES.personasBg}
            alt="Người dùng OmniCare"
            className="h-full w-full object-cover"
          />
          <div className="absolute right-3 bottom-3 left-3 flex gap-1.5 md:right-5 md:bottom-5 md:left-5 md:gap-2">
            <Link
              to={ctaTo}
              className="bg-surface flex h-36 flex-1 flex-col justify-between rounded-xl p-3 md:h-52 md:rounded-2xl md:p-5"
            >
              <h4 className="font-heading text-primary text-lg leading-5 font-bold md:text-2xl md:leading-7">
                Người làm
                <br />
                việc trí óc,
                <br />
                ngồi nhiều
              </h4>
              <ArrowIcon />
            </Link>
            <Link
              to={ctaTo}
              className="flex h-36 flex-1 flex-col justify-between rounded-xl bg-white/20 p-3 backdrop-blur-xl md:h-52 md:rounded-2xl md:p-5"
            >
              <h4 className="font-heading text-lg leading-5 font-bold text-white md:text-2xl md:leading-7">
                Quản lý
                <br />
                sức khỏe
                <br />
                gia đình
              </h4>
              <ArrowIcon light />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
