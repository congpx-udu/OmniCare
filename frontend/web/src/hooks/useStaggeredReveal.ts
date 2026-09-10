import { useEffect, useState, type RefObject } from 'react'

/**
 * true khi phần tử `ref` cuộn vào màn hình (một lần, không tắt lại).
 * Kết hợp với `staggerStyle(visible, i)` để hiện dần từng phần tử.
 */
export function useStaggeredReveal(ref: RefObject<HTMLElement | null>, threshold = 0.15) {
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])

  return visible
}
