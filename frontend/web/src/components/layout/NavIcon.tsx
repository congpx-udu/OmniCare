import type { SVGProps } from 'react'

/** Bộ icon nét mảnh dùng chung toàn app (một phong cách: stroke 1.8, bo tròn). Thêm icon mới vào PATHS. */
export type NavIconName =
  | 'home'
  | 'chat'
  | 'scan'
  | 'profile'
  | 'weather'
  | 'activity'
  | 'food'
  | 'heart'
  | 'moon'
  | 'wind'
  | 'scale'
  | 'logout'
  | 'menu'
  | 'close'
  | 'plus'
  | 'trash'
  | 'refresh'
  | 'check'
  | 'upload'
  | 'search'
  | 'calendar'
  | 'pill'
  | 'droplet'
  | 'thermometer'
  | 'sun'
  | 'eye'
  | 'info'
  | 'sparkles'
  | 'send'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'arrow-right'
  | 'pencil'
  | 'target'
  | 'pin'
  | 'basket'
  | 'alert'
  | 'clipboard'
  | 'ruler'
  | 'clock'
  | 'bed'
  | 'walk'
  | 'smile'
  | 'hospital'
  | 'stethoscope'
  | 'sidebar'
  | 'more'
  | 'save'
  | 'image'
  | 'filter'
  | 'phone'
  | 'mail'
  | 'user'
  | 'gender'
  | 'cake'

const PATHS: Record<NavIconName, string> = {
  home: 'M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10',
  chat: 'M4 5h16v11H8l-4 4V5z M8 9h8 M8 12h5',
  scan: 'M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4 M7 12h10',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 20a8 8 0 0 1 16 0',
  weather: 'M7 17a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8.5a4.25 4.25 0 0 1 .5 8.5H7z',
  activity: 'M3 12h4l3-8 4 16 3-8h4',
  food: 'M4 12h16a8 8 0 0 1-16 0z M9 12V6a3 3 0 0 1 6 0v6 M6 20h12',
  heart: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  wind: 'M3 8h10a3 3 0 1 0-3-3 M3 12h15a3 3 0 1 1-3 3 M3 16h7a2 2 0 1 1-2 2',
  scale: 'M12 3v18 M5 7l7-2 7 2 M3 13l2-6 2 6a2 2 0 0 1-4 0z M17 13l2-6 2 6a2 2 0 0 1-4 0z',
  logout: 'M10 4H5v16h5 M14 8l4 4-4 4 M9 12h9',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v6M14 11v6',
  refresh: 'M20 12a8 8 0 1 1-2.3-5.7 M20 4v5h-5',
  check: 'M5 12l5 5L20 7',
  upload: 'M12 16V4 M7 9l5-5 5 5 M4 16v4h16v-4',
  search: 'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z M21 21l-5-5',
  calendar: 'M4 6h16v14H4z M4 10h16 M8 3v4M16 3v4',
  pill: 'M8.5 3.5a5 5 0 0 1 7 7l-5 5a5 5 0 0 1-7-7z M7 10l7 7',
  droplet: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  thermometer: 'M10 4a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z M12 9v8',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5 M12 8h.01',
  sparkles:
    'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z M5 15l.6 1.4L7 17l-1.4.6L5 19l-.6-1.4L3 17l1.4-.6z',
  send: 'M22 2 11 13 M22 2 15 22l-4-9-9-4z',
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-left': 'M15 6l-6 6 6 6',
  'chevron-down': 'M6 9l6 6 6-6',
  'arrow-right': 'M5 12h14 M13 6l6 6-6 6',
  pencil: 'M4 20h4l10-10-4-4L4 16v4z M13 7l4 4',
  target:
    'M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M12 2v4M12 18v4M2 12h4M18 12h4',
  pin: 'M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  basket: 'M3 10h18l-2 10H5z M8 10l4-6 4 6 M9 14v3M15 14v3',
  alert: 'M12 3l10 18H2z M12 10v4 M12 17h.01',
  clipboard: 'M9 4h6v3H9z M7 6H5v15h14V6h-2 M9 12h6M9 16h6',
  ruler: 'M3 17L17 3l4 4L7 21z M8 12l2 2 M11 9l2 2 M14 6l2 2',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  bed: 'M3 18v-7h18v7 M3 15h18 M5 11V7h6v4 M3 18v2M21 18v2',
  walk: 'M13 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M10 22l2-6 3 2 1 4 M8 13l3-4 3 1 3 3 M11 9l-1 5-3 2',
  smile: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M8 14s1.5 2 4 2 4-2 4-2 M9 10h.01M15 10h.01',
  hospital: 'M4 21V5h16v16 M9 21v-5h6v5 M12 8v6M9 11h6',
  stethoscope:
    'M6 3v6a5 5 0 0 0 10 0V3 M11 14v3a4 4 0 0 0 8 0v-2 M19 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  sidebar: 'M4 5h16v14H4z M9 5v14',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  save: 'M5 4h11l3 3v13H5z M8 4v5h7V4 M8 20v-6h8v6',
  image: 'M4 5h16v14H4z M4 16l4-4 3 3 4-5 5 6 M9 9h.01',
  filter: 'M4 5h16l-6 7v6l-4 2v-8z',
  phone:
    'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  mail: 'M4 6h16v12H4z M4 7l8 6 8-6',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 20a8 8 0 0 1 16 0',
  gender: 'M10 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M10 14v7 M7 18h6 M15 5l5-1-1 5 M20 4l-4.5 4.5',
  cake: 'M4 20h16 M5 20v-7h14v7 M5 13a2 2 0 0 1 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 1 2 0 M8 10V7M12 10V6M16 10V7 M12 3v1',
}

interface NavIconProps extends SVGProps<SVGSVGElement> {
  name: NavIconName
}

/** Icon nét mảnh dùng toàn app, kế thừa màu từ currentColor. Trang trí cạnh chữ thì để aria-hidden (mặc định). */
export function NavIcon({ name, ...props }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
