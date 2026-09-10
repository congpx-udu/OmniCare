import { useEffect, useState } from 'react'

const QUERY = '(max-width: 767px)'

/** true dưới breakpoint md (768px). Cập nhật khi đổi kích thước cửa sổ. */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(QUERY).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return isMobile
}
