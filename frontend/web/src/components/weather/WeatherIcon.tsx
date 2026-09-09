import { cn } from '@/utils'

interface WeatherIconProps {
  /** Mã icon OpenWeather, ví dụ "10d" */
  code: string
  alt: string
  className?: string
}

/** Icon thời tiết lấy trực tiếp từ bộ icon chính thức của OpenWeather */
export function WeatherIcon({ code, alt, className }: WeatherIconProps) {
  return (
    <img
      src={`https://openweathermap.org/img/wn/${code}@2x.png`}
      alt={alt}
      loading="lazy"
      className={cn('size-12 select-none', className)}
    />
  )
}
