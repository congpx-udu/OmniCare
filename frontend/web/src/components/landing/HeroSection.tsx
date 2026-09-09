import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { HERO_BARS, LANDING_FOCAL, LANDING_IMAGES, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { useImageWidth } from '@/hooks/useImageWidth'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useMaskPositions } from '@/hooks/useMaskPositions'
import { useStaggeredReveal } from '@/hooks/useStaggeredReveal'
import { staggerStyle } from '@/utils'
import { MaskedCard } from './MaskedCard'

/** Màn 1: 3 thanh nổi bật + card hero lớn, chung một ảnh nền (masked cards) */
export function HeroSection() {
  const { isAuthenticated } = useAuth()
  const isMobile = useIsMobile()
  const sectionRef = useRef<HTMLElement | null>(null)
  const cardsRef = useRef<Array<HTMLDivElement | null>>([])
  const positions = useMaskPositions(sectionRef, cardsRef)
  const sectionHeight = positions[0]?.sh ?? 0
  const imageWidth = useImageWidth(LANDING_IMAGES.hero, sectionHeight)
  const focalX = isMobile ? LANDING_FOCAL.hero.mobile : LANDING_FOCAL.hero.desktop
  const visible = useStaggeredReveal(sectionRef)

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="flex h-screen w-full flex-col gap-1.5 overflow-hidden px-3 pt-24 pb-1.5 md:gap-2 md:px-5 md:pb-2"
    >
      {HERO_BARS.map((label, i) => (
        <MaskedCard
          key={label}
          cardRef={(el) => {
            cardsRef.current[i] = el
          }}
          bgImage={LANDING_IMAGES.hero}
          position={positions[i]}
          imageWidth={imageWidth}
          focalX={focalX}
          className="relative h-14 w-full shrink-0 overflow-hidden rounded-xl md:h-20 md:rounded-2xl"
          style={staggerStyle(visible, i)}
        >
          <span className="font-heading text-primary relative z-10 flex h-full items-center justify-center text-center text-lg font-bold md:text-3xl">
            {label}
          </span>
        </MaskedCard>
      ))}

      <MaskedCard
        cardRef={(el) => {
          cardsRef.current[3] = el
        }}
        bgImage={LANDING_IMAGES.hero}
        position={positions[3]}
        imageWidth={imageWidth}
        focalX={focalX}
        className="relative min-h-0 w-full flex-1 overflow-hidden rounded-xl md:rounded-2xl"
        style={staggerStyle(visible, 3)}
      >
        {/* Nội dung xếp theo cột: mô tả ở trên, tiêu đề + CTA ở dưới, không bao giờ đè nhau */}
        <div className="relative z-10 flex h-full flex-col justify-between p-4 md:p-7">
          <p className="text-primary max-w-[220px] text-xs leading-4 font-semibold md:max-w-[340px] md:text-sm md:leading-5">
            Một trợ lý duy nhất thay cho nhiều ứng dụng rời rạc, hiểu thời tiết, vị trí và cảm nhận
            của bạn hôm nay.
          </p>

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <span className="text-primary mb-1 block text-xs font-semibold md:mb-2 md:text-sm">
                Trợ lý Sức khỏe Toàn diện AI
              </span>
              <h1 className="font-heading text-primary text-[clamp(2.5rem,min(11vw,18vh),11rem)] leading-[0.82] font-bold tracking-tight">
                Omni
                <br />
                Care
              </h1>
            </div>
            <Link
              to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER}
              className="bg-primary font-heading hover:bg-primary-600 shrink-0 rounded-full px-5 py-3 text-sm font-bold whitespace-nowrap text-white transition-colors md:px-8 md:py-4 md:text-lg"
            >
              {isAuthenticated ? 'Vào ứng dụng' : 'Dùng thử miễn phí'}
            </Link>
          </div>
        </div>
      </MaskedCard>
    </section>
  )
}
