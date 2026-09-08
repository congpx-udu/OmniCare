export function formatDate(value: string | Date, locale = 'vi-VN') {
  return new Date(value).toLocaleDateString(locale)
}
