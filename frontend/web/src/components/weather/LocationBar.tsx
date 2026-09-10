import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/common'
import type { WeatherLocationQuery } from '@/types'

interface LocationBarProps {
  onSelect: (query: WeatherLocationQuery) => void
  /** Định vị lại bằng trình duyệt */
  onLocate: () => void
  loading?: boolean
  locating?: boolean
  /** Tên vị trí đang hiển thị */
  currentName?: string | null
  /** Lỗi định vị (bị từ chối, không hỗ trợ) để gợi ý nhập tay */
  geoError?: string | null
  /** Mở sẵn ô nhập thành phố (khi chưa có vị trí) */
  defaultOpen?: boolean
}

/** Dòng vị trí gọn: tên nơi đang xem + "Đổi vị trí" mở ô nhập thành phố / định vị lại */
export function LocationBar({
  onSelect,
  onLocate,
  loading = false,
  locating = false,
  currentName,
  geoError,
  defaultOpen = false,
}: LocationBarProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [city, setCity] = useState('')
  const [cityError, setCityError] = useState<string | null>(null)

  const submitCity = (e: FormEvent) => {
    e.preventDefault()
    const value = city.trim()
    if (value.length < 2) {
      setCityError('Nhập tên thành phố, ví dụ: Hà Nội')
      return
    }
    setCityError(null)
    onSelect({ city: value })
    setCity('')
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
        <span className="inline-flex items-center gap-1.5">
          <svg
            viewBox="0 0 24 24"
            className="text-secondary size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" />
            <circle cx="12" cy="11" r="2" />
          </svg>
          {locating
            ? 'Đang xác định vị trí của bạn...'
            : currentName
              ? `Vị trí: ${currentName}`
              : geoError
                ? 'Không lấy được vị trí tự động'
                : 'Chưa có vị trí'}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-secondary font-semibold hover:underline"
        >
          {open ? 'Đóng' : 'Đổi vị trí'}
        </button>
        <button
          type="button"
          onClick={onLocate}
          disabled={locating || loading}
          className="text-secondary font-semibold hover:underline disabled:opacity-50"
        >
          Định vị lại
        </button>
      </div>

      {open && (
        <form
          onSubmit={submitCity}
          noValidate
          className="rounded-card bg-surface flex items-end gap-2 border border-neutral-200 p-3"
        >
          <div className="flex-1">
            <Input
              label="Thành phố"
              name="city"
              placeholder="Hà Nội, Đà Nẵng, Hồ Chí Minh..."
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
      )}

      {geoError && !currentName && (
        <p className="text-xs text-neutral-500">
          Trình duyệt không cho lấy vị trí ({geoError}). Hãy nhập tên thành phố.
        </p>
      )}
    </div>
  )
}
