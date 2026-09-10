import { useEffect, useState } from 'react'

/**
 * Theo dõi mục nào trong danh sách id đang ở đầu khung nhìn khi cuộn trang,
 * để tô đậm mục tương ứng trên menu (scrollspy). Trả về id đang active hoặc null.
 */
export function useActiveSection(ids: readonly string[], rootMargin = '-45% 0px -50% 0px') {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        // Trong các mục đang giao với dải quan sát, chọn mục gần đỉnh nhất
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        setActive(visible[0].target.id)
      },
      { rootMargin, threshold: 0 },
    )
    elements.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids, rootMargin])

  return active
}
