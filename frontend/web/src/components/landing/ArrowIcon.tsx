import { cn } from '@/utils'

/** Mũi tên chéo trong vòng tròn, dùng cho card có link */
export function ArrowIcon({ light = false }: { light?: boolean }) {
  return (
    <span
      className={cn(
        'flex size-9 items-center justify-center self-end rounded-full border md:size-12',
        light ? 'border-white text-white' : 'border-primary text-primary',
      )}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="-rotate-45">
        <path
          d="M1 7h12m0 0L8 2m5 5L8 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
