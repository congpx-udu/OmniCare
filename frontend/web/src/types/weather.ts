/** Dữ liệu thời tiết từ GET /context/weather (đã chuẩn hóa ở backend, đơn vị metric) */
export interface WeatherSnapshot {
  location: { name: string; country: string | null; lat: number; lon: number }
  current: {
    temp: number
    feelsLike: number
    tempMin: number
    tempMax: number
    humidity: number
    pressure: number
    windKmh: number
    visibilityKm: number | null
    clouds: number | null
    rainMm: number | null
    description: string
    /** Mã icon OpenWeather, ví dụ "10d" */
    icon: string
    conditionId: number
    observedAt: string
    sunrise: string
    sunset: string
  }
  /** 8 mốc tiếp theo, cách nhau 3 giờ */
  hourly: Array<{
    at: string
    temp: number
    feelsLike: number
    description: string
    icon: string
    /** Xác suất mưa 0–1 */
    pop: number
    rainMm: number | null
  }>
  daily: Array<{
    /** yyyy-mm-dd theo giờ địa phương */
    date: string
    tempMin: number
    tempMax: number
    description: string
    icon: string
    pop: number
    humidity: number
  }>
  /** Chất lượng không khí (OpenWeather Air Pollution); null khi không lấy được */
  airQuality: {
    /** 1 tốt · 2 khá · 3 trung bình · 4 kém · 5 rất kém */
    aqi: 1 | 2 | 3 | 4 | 5
    label: string
    pm25: number
    pm10: number
    observedAt: string
  } | null
  timezoneOffset: number
  fetchedAt: string
  cached: boolean
}

/** "Ảnh hưởng đến bạn" từ GET /context/weather/insight */
export interface WeatherInsight {
  summary: string
  tips: Array<{ title: string; detail: string }>
  mealIdea: string | null
  activityIdea: string | null
  timeOfDay: string
  disclaimer: string
  generatedAt: string
  cached: boolean
}

/** Cách người dùng chọn vị trí: định vị trình duyệt hoặc nhập tay thành phố */
export type WeatherLocationQuery = { lat: number; lon: number } | { city: string }
