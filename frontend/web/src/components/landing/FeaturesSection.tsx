import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { FEATURE_CARDS, LANDING_FOCAL, LANDING_IMAGES, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { useImageWidth } from '@/hooks/useImageWidth'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useMaskPositions } from '@/hooks/useMaskPositions'
import { useStaggeredReveal } from '@/hooks/useStaggeredReveal'
import { staggerStyle } from '@/utils'
import { cn } from '@/utils'
import { MaskedCard } from './MaskedCard'

/** Màn 2: lưới 4 card chung ảnh nền, card cuối chứa 4 thẻ tính năng */
export function FeaturesSection() {
  const { isAuthenticated } = useAuth()
  const isMobile = useIsMobile()
  const sectionRef = useRef<HTMLElement | null>(null)
  const cardsRef = useRef<Array<HTMLDivElement | null>>([])
  const positions = useMaskPositions(sectionRef, cardsRef)
  const sectionHeight = positions[0]?.sh ?? 0
  const imageWidth = useImageWidth(LANDING_IMAGES.features, sectionHeight)
  const focalX = isMobile ? LANDING_FOCAL.features.mobile : LANDING_FOCAL.features.desktop
  const visible = useStaggeredReveal(sectionRef)
  const card = (i: number) => ({
    cardRef: (el: HTMLDivElement | null) => {
      cardsRef.current[i] = el
    },
    bgImage: LANDING_IMAGES.features,
    position: positions[i],
    imageWidth,
    focalX,
    style: staggerStyle(visible, i),
  })

  return (
    <section
      id="features"
      ref={sectionRef}
      className="flex min-h-screen w-full flex-col gap-1.5 overflow-hidden px-3 pt-16 pb-1.5 md:h-screen md:gap-2 md:px-5 md:pt-20 md:pb-2"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_auto_auto_auto] gap-1.5 md:grid-cols-2 md:grid-rows-[1fr_1fr_0.8fr] md:gap-2">
        {/* Card 0 */}
        <MaskedCard
          {...card(0)}
          className="relative min-h-[160px] overflow-hidden rounded-xl md:min-h-0 md:rounded-2xl"
        >
          <h2 className="font-heading absolute top-4 left-5 z-10 text-2xl font-bold text-white md:top-6 md:left-7 md:text-3xl">
            Tính năng
          </h2>
          <p className="absolute bottom-4 left-5 z-10 text-xs font-semibold text-white md:bottom-6 md:left-7 md:text-sm">
            Mọi thứ trong một trợ lý
          </p>
        </MaskedCard>

        {/* Card 1: cao 2 hàng */}
        <MaskedCard
          {...card(1)}
          className="relative min-h-[200px] overflow-hidden rounded-xl md:row-span-2 md:min-h-0 md:rounded-2xl"
        >
          <p className="absolute bottom-16 left-5 z-10 text-xs leading-4 font-semibold text-white md:bottom-20 md:left-7 md:text-sm md:leading-5">
            Kể triệu chứng, chụp đơn thuốc, cho phép vị trí.
            <br />
            OmniCare lo phần còn lại: phân tích, gợi ý, nhắc nhở.
          </p>
          <Link
            to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER}
            className="bg-surface text-primary font-heading absolute right-4 bottom-4 z-10 rounded-full px-5 py-3 text-base font-bold transition-transform hover:scale-105 md:right-6 md:bottom-6 md:px-8 md:py-5 md:text-xl"
          >
            {isAuthenticated ? 'Vào ứng dụng' : 'Bắt đầu'}
          </Link>
        </MaskedCard>

        {/* Card 2 */}
        <MaskedCard
          {...card(2)}
          className="relative min-h-[160px] overflow-hidden rounded-xl md:min-h-0 md:rounded-2xl"
        >
          <h3 className="font-heading absolute top-4 left-5 z-10 text-[clamp(3rem,7vw,6rem)] leading-[0.9] font-bold text-white md:top-6 md:left-7">
            Sức khỏe
            <br />
            chủ động
          </h3>
        </MaskedCard>

        {/* Card 3: 4 thẻ tính năng */}
        <MaskedCard
          {...card(3)}
          className="relative col-span-1 min-h-[200px] overflow-hidden rounded-xl md:col-span-2 md:min-h-0 md:rounded-2xl"
        >
          <div className="absolute inset-0 z-10 flex flex-wrap gap-1.5 p-2 md:flex-nowrap md:gap-2 md:p-3">
            {FEATURE_CARDS.map((f) => (
              <div
                key={f.name}
                className={cn(
                  'flex min-w-[calc(50%-4px)] flex-1 flex-col justify-between rounded-xl p-3 md:min-w-0 md:rounded-2xl md:p-5',
                  f.active ? 'bg-surface/90 backdrop-blur-md' : 'bg-white/20 backdrop-blur-xl',
                )}
              >
                <h3
                  className={cn(
                    'font-heading text-xl leading-[1.05] font-bold whitespace-pre-line md:text-4xl',
                    f.active ? 'text-primary' : 'text-white',
                  )}
                >
                  {f.name}
                </h3>
                {f.num && (
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center self-end rounded-full border text-xs font-semibold md:size-12 md:text-sm',
                      f.active ? 'border-primary text-primary' : 'border-white text-white',
                    )}
                  >
                    {f.num}
                  </span>
                )}
              </div>
            ))}
          </div>
        </MaskedCard>
      </div>
    </section>
  )
}
