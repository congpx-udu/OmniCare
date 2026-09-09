import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/common'
import { useGeolocation } from '@/hooks/useGeolocation'
import type { WeatherLocationQuery } from '@/types'

interface LocationBarProps {
  onSelect: (query: WeatherLocationQuery) => void
  loading?: boolean
  /** Tên vị trí đang hiển thị, để điền gợi ý */
  currentName?: string | null
}

/** Chọn vị trí: định vị trình duyệt (khi người dùng bấm) hoặc nhập tay tên thành phố */
export function LocationBar({ onSelect, loading = false, currentName }: LocationBarProps) {
  const geo = useGeolocation()
  const [city, setCity] = useState('')
  const [cityError, setCityError] = useState<string | null>(null)

  const useMyLocation = () => {
    geo.request((c) => onSelect({ lat: c.lat, lon: c.lng }))
  }

  const submitCity = (e: FormEvent) => {
    e.preventDefault()
    const value = city.trim()
    if (value.length < 2) {
      setCityError('Nhập tên thành phố, ví dụ: Hà Nội')
      return
    }
    setCityError(null)
    onSelect({ city: value })
  }

  return (
    <div className="rounded-card bg-surface flex flex-col gap-3 border border-neutral-200 p-4 sm:flex-row sm:items-end">
      <form onSubmit={submitCity} noValidate className="flex flex-1 items-end gap-2">
        <div className="flex-1">
          <Input
            label="Thành phố"
            name="city"
            placeholder={
              currentName ? `Đang xem: ${currentName}` : 'Hà Nội, Đà Nẵng, Hồ Chí Minh...'
            }
            value={city}
            onChange={(e) => setCity(e.target.value)}
            error={cityError ?? undefined}
            autoComplete="off"
          />
        </div>
        <Button type="submit" variant="outline" loading={loading} className="mb-[1px]">
          Xem
        </Button>
      </form>
      <div className="space-y-1.5">
        <Button
          type="button"
          onClick={useMyLocation}
          loading={geo.loading}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" />
            <circle cx="12" cy="11" r="2" />
          </svg>
          Dùng vị trí hiện tại
        </Button>
        {geo.error && <p className="text-danger text-xs">Không lấy được vị trí: {geo.error}</p>}
      </div>
    </div>
  )
}
