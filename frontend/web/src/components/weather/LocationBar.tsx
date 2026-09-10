import { useState, type FormEvent, type ReactNode } from 'react'
import { Button, Input } from '@/components/common'
import { cn } from '@/utils'
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

interface IconButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  children: ReactNode
}

/** Nút icon tròn, tooltip hiện tên chức năng khi hover/focus (group-hover), vẫn có aria-label */
function IconButton({ label, onClick, disabled, active, children }: IconButtonProps) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          'flex size-8 items-center justify-center rounded-full border transition disabled:opacity-50',
          active
            ? 'border-secondary bg-secondary text-white'
            : 'bg-surface hover:border-secondary hover:text-secondary border-neutral-200 text-neutral-600',
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {children}
        </svg>
      </button>
      <span
        role="tooltip"
        className="bg-primary pointer-events-none absolute top-full right-0 z-10 mt-1.5 rounded-md px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow transition group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {label}
      </span>
    </span>
  )
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
        <IconButton
          label={open ? 'Đóng ô nhập thành phố' : 'Đổi vị trí (nhập tên thành phố)'}
          onClick={() => setOpen((v) => !v)}
          active={open}
        >
          {/* bút chì */}
          <path d="M4 20h4l10-10-4-4L4 16v4z" />
          <path d="M13 7l4 4" />
        </IconButton>
        <IconButton
          label="Định vị lại bằng vị trí hiện tại"
          onClick={onLocate}
          disabled={locating || loading}
        >
          {/* mục tiêu / crosshair */}
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="1.5" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </IconButton>
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
