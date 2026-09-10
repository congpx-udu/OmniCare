import { Link } from 'react-router-dom'
import { NavIcon, type NavIconName } from '@/components/layout/NavIcon'

interface ShortcutCardProps {
  to: string
  icon: NavIconName
  title: string
  desc: string
}

/** Lối tắt sang tính năng: icon trong ô vuông teal nhạt + tiêu đề + mô tả ngắn */
export function ShortcutCard({ to, icon, title, desc }: ShortcutCardProps) {
  return (
    <Link
      to={to}
      className="group card-3d rounded-card bg-surface-cream hover:border-primary-200 flex gap-4 border border-neutral-200/80 p-5"
    >
      <span className="bg-secondary-50 text-secondary flex size-11 shrink-0 items-center justify-center rounded-xl">
        <NavIcon name={icon} className="size-5" />
      </span>
      <div>
        <h3 className="group-hover:text-secondary text-base">{title}</h3>
        <p className="mt-1 text-sm text-neutral-600">{desc}</p>
      </div>
    </Link>
  )
}
