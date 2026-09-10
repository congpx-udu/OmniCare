import type { WeatherLocationQuery } from '@/types'
import { useLocationBar } from './useLocationBar'

interface LocationBarProps {
  onSelect: (query: WeatherLocationQuery) => void
  onLocate: () => void
  loading?: boolean
  locating?: boolean
  geoError?: string | null
  defaultOpen?: boolean
}

/** Bản độc lập của điều khiển vị trí (nút icon + ô nhập); trang Thời tiết dùng useLocationBar để đặt vào PageHeader */
export function LocationBar(props: LocationBarProps) {
  const { actions, panel } = useLocationBar(props)
  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">{actions}</div>
      {panel}
    </div>
  )
}
