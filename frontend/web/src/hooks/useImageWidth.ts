import { useEffect, useState } from 'react'

/**
 * Chiều rộng ảnh sẽ có nếu scale để lấp đầy chiều cao section
 * (giữ tỉ lệ). Dùng để canh focal point khi ảnh rộng hơn section.
 */
export function useImageWidth(src: string, sectionHeight: number) {
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null)

  useEffect(() => {
    if (!src) return
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled && img.naturalHeight > 0) {
        setNaturalRatio(img.naturalWidth / img.naturalHeight)
      }
    }
    img.src = src
    return () => {
      cancelled = true
    }
  }, [src])

  return naturalRatio ? naturalRatio * sectionHeight : 0
}
