import { cn } from '@/utils'

interface AssistantAvatarProps {
  className?: string
}

/** Biểu tượng trợ lý: ô navy bo góc, bong bóng chat với chấm sáng teal (theo design chat) */
export function AssistantAvatar({ className }: AssistantAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'bg-primary text-secondary-300 flex size-9 shrink-0 items-center justify-center rounded-xl',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
        <path
          d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5z"
          fill="currentColor"
          opacity="0.9"
        />
        <path d="M12 6.5l.9 2.1 2.1.9-2.1.9L12 12.5l-.9-2.1L9 9.5l2.1-.9z" fill="#fff" />
        <circle cx="16" cy="7" r="1" fill="#fff" />
      </svg>
    </span>
  )
}
