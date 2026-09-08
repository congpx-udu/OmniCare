import { useCallback, useState } from 'react'

interface Coords {
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

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setError(null)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
  }, [])

  return { coords, error, loading, request }
}
