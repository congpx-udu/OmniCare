import { useEffect, useState, type RefObject } from 'react'

export interface MaskPosition {
  /** Offset trái của card so với section */
  x: number
  /** Offset trên của card so với section */
  y: number
  /** Chiều rộng section */
  sw: number
  /** Chiều cao section */
  sh: number
}

/**
 * Tính vị trí từng card so với section chứa nó, để nhiều card chia sẻ
 * cùng một ảnh nền (kỹ thuật "masked cards"). Cập nhật qua ResizeObserver.
 */
export function useMaskPositions(
  sectionRef: RefObject<HTMLElement | null>,
  cardsRef: RefObject<Array<HTMLElement | null>>,
) {
  const [positions, setPositions] = useState<MaskPosition[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const measure = () => {
      const rect = section.getBoundingClientRect()
      const next = cardsRef.current.map((card) => {
        if (!card) return { x: 0, y: 0, sw: rect.width, sh: rect.height }
        const c = card.getBoundingClientRect()
        return { x: c.left - rect.left, y: c.top - rect.top, sw: rect.width, sh: rect.height }
      })
      setPositions(next)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(section)
    return () => ro.disconnect()
  }, [sectionRef, cardsRef])

  return positions
}
