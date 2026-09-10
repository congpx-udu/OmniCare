import { Link } from 'react-router-dom'
import { NavIcon, type NavIconName } from '@/components/layout/NavIcon'

interface ShortcutCardProps {
  to: string
  icon: NavIconName
  title: string
  /** Mô tả ngắn, 1 dòng nhỏ dưới tiêu đề */
  desc: string
}

/** Lối tắt: icon lớn trong ô teal + tiêu đề ngắn + mô tả 1 dòng */
export function ShortcutCard({ to, icon, title, desc }: ShortcutCardProps) {
  return (
    <Link
      to={to}
      className="group card-3d rounded-card bg-surface-cream hover:border-primary-200 flex w-full flex-col items-center gap-3 border border-neutral-200/80 p-5 text-center"
    >
      <span className="bg-secondary-50 text-secondary group-hover:bg-secondary flex size-14 items-center justify-center rounded-2xl transition group-hover:text-white">
        <NavIcon name={icon} className="size-7" />
      </span>
      <span className="min-w-0">
        <h3 className="group-hover:text-secondary text-sm leading-snug sm:text-base">{title}</h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{desc}</p>
      </span>
    </Link>
  )
}
