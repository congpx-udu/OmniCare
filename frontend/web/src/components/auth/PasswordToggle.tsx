interface PasswordToggleProps {
  visible: boolean
  onToggle: () => void
}

/** Nút mắt hiện/ẩn mật khẩu, dùng trong rightSlot của Input */
export function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      className="hover:text-primary rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100"
    >
      {visible ? (
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 002.8 2.8" />
          <path d="M9.9 5.1A9.7 9.7 0 0112 5c5 0 8.6 3.6 10 7-.5 1.2-1.3 2.4-2.3 3.4" />
          <path d="M6.6 6.6C4.6 7.9 3 9.7 2 12c1.4 3.4 5 7 10 7 1.5 0 2.9-.3 4.1-.9" />
        </svg>
      ) : (
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        >
          <path d="M2 12c1.4-3.4 5-7 10-7s8.6 3.6 10 7c-1.4 3.4-5 7-10 7S3.4 15.4 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )
}
