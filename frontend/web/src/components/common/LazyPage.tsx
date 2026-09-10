import { Suspense, type ReactNode } from 'react'

/** Bọc trang lazy (React.lazy) với fallback nhẹ; dùng trong routes.tsx */
export function LazyPage({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-neutral-500">Đang tải...</p>}>
      {children}
    </Suspense>
  )
}
