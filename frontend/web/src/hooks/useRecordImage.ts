import { useEffect, useState } from 'react'
import { recordService } from '@/services/recordService'

/**
 * Ảnh gốc của hồ sơ nằm sau xác thực nên không dùng <img src> trực tiếp:
 * tải Blob qua axios (có token) rồi tạo object URL, thu hồi khi đổi id/unmount.
 */
export function useRecordImage(id: string | null, page = 0) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let objectUrl: string | null = null
    let cancelled = false
    recordService
      .image(id, page)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError('Không tải được ảnh')
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setUrl(null)
    }
  }, [id, page])

  return { url, error }
}
