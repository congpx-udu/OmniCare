import type { CSSProperties } from 'react'

const EASE = 'cubic-bezier(0.16,1,0.3,1)'

/** Style hiện dần: phần tử thứ `index` trễ index*120ms */
export function staggerStyle(visible: boolean, index: number): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.6s ${EASE} ${index * 120}ms, transform 0.6s ${EASE} ${index * 120}ms`,
  }
}
