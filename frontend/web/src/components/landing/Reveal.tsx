import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/utils'

interface RevealProps {
  children: ReactNode
  /** Trễ theo thứ tự phần tử trong nhóm (ms) */
  delay?: number
  className?: string
}

/** Hiện dần khi cuộn tới (IntersectionObserver). Tôn trọng prefers-reduced-motion: hiện ngay. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  // Người dùng tắt hiệu ứng → hiện ngay từ lần render đầu, không cần observer
  const [shown, setShown] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
      className={cn(
        'transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
