export function formatDate(value: string | Date, locale = 'vi-VN') {
  return new Date(value).toLocaleDateString(locale)
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Giờ:phút theo múi giờ của vị trí (offset giây so với UTC), không phụ thuộc múi giờ máy */
export function formatTime(iso: string, timezoneOffsetSec: number) {
  const d = new Date(new Date(iso).getTime() + timezoneOffsetSec * 1000)
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

/** "T4 10/09" từ ngày yyyy-mm-dd */
export function formatWeekday(dateYmd: string) {
  const [y, m, day] = dateYmd.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1, day))
  return `${WEEKDAYS[d.getUTCDay()]} ${pad(day)}/${pad(m)}`
}
