import type { SVGProps } from 'react'

export type NavIconName =
  'home' | 'chat' | 'scan' | 'profile' | 'weather' | 'logout' | 'menu' | 'close'

const PATHS: Record<NavIconName, string> = {
  home: 'M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10',
  chat: 'M4 5h16v11H8l-4 4V5z M8 9h8 M8 12h5',
  scan: 'M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4 M7 12h10',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 20a8 8 0 0 1 16 0',
  weather: 'M7 17a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8.5a4.25 4.25 0 0 1 .5 8.5H7z',
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
