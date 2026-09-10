import { useEffect, useState } from 'react'
import { chatService } from '@/services/chatService'

/**
 * Ảnh đính kèm chat nằm sau xác thực: tải Blob qua axios (có token) rồi tạo object URL,
 * thu hồi khi đổi tin/unmount. Truyền `preview` (object URL cục bộ) để hiện ngay khi đang gửi.
 */
export function useChatImage(messageId: string | null, index: number, preview?: string) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!messageId || preview) return
    let objectUrl: string | null = null
    let cancelled = false
    chatService
      .image(messageId, index)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
        setError(false)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setUrl(null)
    }
  }, [messageId, index, preview])

  return { url: preview ?? url, error }
}
