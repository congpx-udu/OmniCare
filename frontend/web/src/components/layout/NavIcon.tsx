import type { SVGProps } from 'react'

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
}

interface NavIconProps extends SVGProps<SVGSVGElement> {
  name: NavIconName
}

/** Icon nét mảnh dùng cho sidebar / topbar, kế thừa màu từ currentColor */
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
