import { CHAT_MODES } from '@/constants'
import type { ChatMode } from '@/types'
import { cn } from '@/utils'

interface ModeSwitchProps {
  value: ChatMode
  onChange: (mode: ChatMode) => void
  disabled?: boolean
}

/** Bộ chuyển hai luồng chat, dạng segmented control */
export function ModeSwitch({ value, onChange, disabled = false }: ModeSwitchProps) {
  return (
    <div
      role="tablist"
      aria-label="Luồng trò chuyện"
      className="bg-surface-muted inline-flex w-full rounded-xl p-1 sm:w-auto"
    >
      {CHAT_MODES.map((m) => {
        const active = m.mode === value
        return (
          <button
            key={m.mode}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(m.mode)}
            className={cn(
              'font-heading flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none',
              active
                ? 'bg-surface text-primary shadow-sm'
                : 'hover:text-primary text-neutral-600 disabled:opacity-60',
            )}
          >
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
