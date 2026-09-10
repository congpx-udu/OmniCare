import { useCallback, useState } from 'react'

export interface Coords {
  lat: number
  lng: number
}

/**
 * Lấy vị trí khi người dùng chủ động bấm (phải xin quyền rõ ràng).
 * Có error để UI hiển thị fallback nhập tay thành phố.
 */
export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  /** @param onSuccess gọi ngay khi có tọa độ, tiện để phát request thời tiết theo sự kiện bấm */
  const request = useCallback((onSuccess?: (coords: Coords) => void) => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(next)
        setError(null)
        setLoading(false)
        onSuccess?.(next)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
  }, [])

  return { coords, error, loading, request }
}
