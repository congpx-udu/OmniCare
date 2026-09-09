import { z } from 'zod'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { ApiError } from '../utils/ApiError.js'
import type { WeatherQuery } from '../validators/context.validator.js'

/**
 * Bối cảnh môi trường (AI-02): thời tiết hiện tại + dự báo theo vị trí.
 * Dùng OpenWeather gói free: /data/2.5/weather, /data/2.5/forecast (5 ngày, mỗi 3h), /geo/1.0.
 * Cache trong bộ nhớ 10 phút theo tọa độ làm tròn 2 số để giữ NFR-03 và tiết kiệm hạn mức.
 */

const OWM = 'https://api.openweathermap.org'
const CACHE_TTL_MS = 10 * 60 * 1000
const FETCH_TIMEOUT_MS = 6000

// ---------- Zod cho response OpenWeather (chỉ lấy trường cần dùng) ----------

const weatherItem = z.object({
  id: z.number(),
  main: z.string(),
  description: z.string(),
  icon: z.string(),
})

const currentSchema = z.object({
  coord: z.object({ lat: z.number(), lon: z.number() }),
  weather: z.array(weatherItem).min(1),
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
    pressure: z.number(),
    humidity: z.number(),
  }),
  visibility: z.number().optional(),
  wind: z.object({ speed: z.number(), deg: z.number().optional(), gust: z.number().optional() }),
  clouds: z.object({ all: z.number() }).optional(),
  rain: z.object({ '1h': z.number().optional() }).optional(),
  dt: z.number(),
  sys: z.object({ country: z.string().optional(), sunrise: z.number(), sunset: z.number() }),
  timezone: z.number(),
  name: z.string(),
})

const forecastSchema = z.object({
  list: z.array(
    z.object({
      dt: z.number(),
      main: z.object({
        temp: z.number(),
        feels_like: z.number(),
        temp_min: z.number(),
        temp_max: z.number(),
        humidity: z.number(),
      }),
      weather: z.array(weatherItem).min(1),
      wind: z.object({ speed: z.number() }),
      pop: z.number().optional(),
      rain: z.object({ '3h': z.number().optional() }).optional(),
    }),
  ),
  city: z.object({
    name: z.string(),
    country: z.string().optional(),
    timezone: z.number(),
  }),
})

const geoItemSchema = z.object({
  name: z.string(),
  local_names: z.record(z.string(), z.string()).optional(),
  lat: z.number(),
  lon: z.number(),
  country: z.string().optional(),
  state: z.string().optional(),
})

// ---------- Kiểu trả về cho client ----------

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
    icon: string
    conditionId: number
    observedAt: string
    sunrise: string
    sunset: string
  }
  /** 8 mốc tiếp theo, mỗi 3 giờ (~24 giờ) */
  hourly: Array<{
    at: string
    temp: number
    feelsLike: number
    description: string
    icon: string
    pop: number
    rainMm: number | null
  }>
  /** Gộp theo ngày địa phương, tối đa 5 ngày */
  daily: Array<{
    date: string
    tempMin: number
    tempMax: number
    description: string
    icon: string
    pop: number
    humidity: number
  }>
  /** Lệch múi giờ so với UTC tại vị trí (giây) */
  timezoneOffset: number
  fetchedAt: string
  cached: boolean
}

// ---------- Cache ----------

const cache = new Map<string, { value: WeatherSnapshot; expiresAt: number }>()

function cacheKey(lat: number, lon: number) {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`
}

function readCache(key: string) {
  const hit = cache.get(key)
  if (hit && hit.expiresAt > Date.now()) return hit.value
  if (hit) cache.delete(key)
  return null
}

// ---------- Gọi OpenWeather ----------

function apiKey() {
  if (!env.OPENWEATHER_API_KEY) {
    throw new ApiError(503, 'Dịch vụ thời tiết chưa được cấu hình')
  }
  return env.OPENWEATHER_API_KEY
}

async function owmFetch<T>(path: string, params: Record<string, string>, schema: z.ZodType<T>) {
  const url = new URL(path, OWM)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  url.searchParams.set('appid', apiKey())
  let res: Response
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
  } catch (err) {
    logger.warn({ err, path }, 'OpenWeather request failed')
    throw new ApiError(502, 'Không kết nối được dịch vụ thời tiết, thử lại sau')
  }
  if (res.status === 404) throw ApiError.notFound('Không tìm thấy địa điểm')
  if (!res.ok) {
    logger.warn({ status: res.status, path }, 'OpenWeather returned error')
    throw new ApiError(502, 'Dịch vụ thời tiết trả lỗi, thử lại sau')
  }
  const parsed = schema.safeParse(await res.json())
  if (!parsed.success) {
    logger.warn({ path, issues: parsed.error.issues.slice(0, 3) }, 'OpenWeather response mismatch')
    throw new ApiError(502, 'Dữ liệu thời tiết không hợp lệ')
  }
  return parsed.data
}

/** Tên địa điểm tiếng Việt nếu OpenWeather có, ngược lại tên mặc định */
function localName(item: z.infer<typeof geoItemSchema>) {
  return item.local_names?.vi ?? item.name
}

async function geocodeCity(city: string) {
  const list = await owmFetch('/geo/1.0/direct', { q: city, limit: '1' }, z.array(geoItemSchema))
  const first = list[0]
  if (!first) throw ApiError.notFound('Không tìm thấy thành phố này')
  return { lat: first.lat, lon: first.lon, name: localName(first), country: first.country ?? null }
}

async function reverseGeocode(lat: number, lon: number) {
  try {
    const list = await owmFetch(
      '/geo/1.0/reverse',
      { lat: String(lat), lon: String(lon), limit: '1' },
      z.array(geoItemSchema),
    )
    const first = list[0]
    return first ? { name: localName(first), country: first.country ?? null } : null
  } catch {
    // Tên địa điểm chỉ để hiển thị; không chặn cả request nếu reverse geocoding lỗi
    return null
  }
}

// ---------- Chuẩn hóa ----------

const toIso = (unix: number) => new Date(unix * 1000).toISOString()
const round1 = (n: number) => Math.round(n * 10) / 10
/** OpenWeather trả mô tả viết thường; viết hoa chữ đầu để hiển thị */
const sentence = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

/** Ngày địa phương yyyy-mm-dd theo offset của vị trí */
function localDate(unix: number, offsetSec: number) {
  return new Date((unix + offsetSec) * 1000).toISOString().slice(0, 10)
}

function buildDaily(
  list: z.infer<typeof forecastSchema>['list'],
  offsetSec: number,
): WeatherSnapshot['daily'] {
  const groups = new Map<string, typeof list>()
  for (const item of list) {
    const day = localDate(item.dt, offsetSec)
    const g = groups.get(day)
    if (g) g.push(item)
    else groups.set(day, [item])
  }
  return [...groups.entries()].slice(0, 5).map(([date, items]) => {
    // Lấy mô tả của mốc gần giữa trưa nhất làm đại diện cho ngày
    const noon = items.reduce((best, it) => {
      const h = (x: (typeof items)[number]) =>
        Math.abs(new Date((x.dt + offsetSec) * 1000).getUTCHours() - 12)
      return h(it) < h(best) ? it : best
    }, items[0])
    return {
      date,
      tempMin: round1(Math.min(...items.map((i) => i.main.temp_min))),
      tempMax: round1(Math.max(...items.map((i) => i.main.temp_max))),
      description: sentence(noon.weather[0].description),
      icon: noon.weather[0].icon,
      pop: round1(Math.max(...items.map((i) => i.pop ?? 0))),
      humidity: Math.round(items.reduce((s, i) => s + i.main.humidity, 0) / items.length),
    }
  })
}

async function fetchSnapshot(lat: number, lon: number): Promise<WeatherSnapshot> {
  const base = { lat: String(lat), lon: String(lon), units: 'metric', lang: 'vi' }
  const [current, forecast, place] = await Promise.all([
    owmFetch('/data/2.5/weather', base, currentSchema),
    owmFetch('/data/2.5/forecast', base, forecastSchema),
    reverseGeocode(lat, lon),
  ])
  const offset = current.timezone
  return {
    location: {
      name: place?.name ?? current.name,
      country: place?.country ?? current.sys.country ?? null,
      lat: current.coord.lat,
      lon: current.coord.lon,
    },
    current: {
      temp: round1(current.main.temp),
      feelsLike: round1(current.main.feels_like),
      tempMin: round1(current.main.temp_min),
      tempMax: round1(current.main.temp_max),
      humidity: current.main.humidity,
      pressure: current.main.pressure,
      windKmh: round1(current.wind.speed * 3.6),
      visibilityKm: current.visibility != null ? round1(current.visibility / 1000) : null,
      clouds: current.clouds?.all ?? null,
      rainMm: current.rain?.['1h'] ?? null,
      description: sentence(current.weather[0].description),
      icon: current.weather[0].icon,
      conditionId: current.weather[0].id,
      observedAt: toIso(current.dt),
      sunrise: toIso(current.sys.sunrise),
      sunset: toIso(current.sys.sunset),
    },
    hourly: forecast.list.slice(0, 8).map((i) => ({
      at: toIso(i.dt),
      temp: round1(i.main.temp),
      feelsLike: round1(i.main.feels_like),
      description: sentence(i.weather[0].description),
      icon: i.weather[0].icon,
      pop: round1(i.pop ?? 0),
      rainMm: i.rain?.['3h'] ?? null,
    })),
    daily: buildDaily(forecast.list, offset),
    timezoneOffset: offset,
    fetchedAt: new Date().toISOString(),
    cached: false,
  }
}

/** Thời tiết theo tọa độ hoặc tên thành phố, có cache 10 phút */
export async function getWeather(query: WeatherQuery): Promise<WeatherSnapshot> {
  let lat: number
  let lon: number
  let cityOverride: { name: string; country: string | null } | null = null
  if ('city' in query) {
    const geo = await geocodeCity(query.city)
    lat = geo.lat
    lon = geo.lon
    cityOverride = { name: geo.name, country: geo.country }
  } else {
    lat = query.lat
    lon = query.lon
  }

  const key = cacheKey(lat, lon)
  const hit = readCache(key)
  if (hit) return { ...hit, cached: true }

  const snapshot = await fetchSnapshot(lat, lon)
  if (cityOverride) snapshot.location = { ...snapshot.location, ...cityOverride }
  cache.set(key, { value: snapshot, expiresAt: Date.now() + CACHE_TTL_MS })
  return snapshot
}

// ---------- Ngữ cảnh gửi AI (dùng chung cho chat và insight) ----------

/** Rút gọn snapshot thành ngữ cảnh thời tiết cho AI service */
export function weatherContext(w: WeatherSnapshot) {
  return {
    location: w.location.name,
    temp: w.current.temp,
    feels_like: w.current.feelsLike,
    humidity: w.current.humidity,
    description: w.current.description,
    wind_kmh: w.current.windKmh,
    rain_chance: w.daily[0]?.pop ?? null,
  }
}

/** Giờ địa phương tại vị trí (theo offset thời tiết), mặc định giờ Việt Nam; kèm buổi trong ngày */
export function localTime(weather: WeatherSnapshot | null) {
  const offsetSec = weather?.timezoneOffset ?? 7 * 3600
  const d = new Date(Date.now() + offsetSec * 1000)
  const h = d.getUTCHours()
  const hh = String(h).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  const period =
    h < 5 || h >= 21
      ? 'đêm khuya'
      : h < 10
        ? 'buổi sáng'
        : h < 14
          ? 'buổi trưa'
          : h < 17
            ? 'buổi chiều'
            : 'buổi tối'
  return { local_time: `${hh}:${mm}`, time_of_day: period, hour: h }
}

/** Một câu mô tả dự báo ngắn hạn để AI nhắc trước (mốc 3h tiếp theo + ngày mai) */
export function forecastNote(w: WeatherSnapshot) {
  const parts: string[] = []
  const next = w.hourly[1] ?? w.hourly[0]
  if (next) {
    parts.push(
      `3 giờ tới ${Math.round(next.temp)}°C, ${next.description.toLowerCase()}` +
        (next.pop >= 0.3 ? `, khả năng mưa ${Math.round(next.pop * 100)}%` : ''),
    )
  }
  const tomorrow = w.daily[1]
  if (tomorrow) {
    parts.push(
      `ngày mai ${Math.round(tomorrow.tempMin)}-${Math.round(tomorrow.tempMax)}°C, ${tomorrow.description.toLowerCase()}`,
    )
  }
  return parts.join('; ') || null
}

/** Dùng cho test / khi đổi API key */
export function clearWeatherCache() {
  cache.clear()
}
