import { Link } from 'react-router-dom'
import { Button } from '@/components/common'
import { ROUTES } from '@/constants'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 pt-40 pb-24 text-center">
      <p className="font-heading text-secondary-200 text-7xl font-extrabold">404</p>
      <h1 className="text-2xl">Không tìm thấy trang</h1>
      <p className="text-sm text-neutral-600">Đường dẫn không tồn tại hoặc đã được di chuyển.</p>
      <Link to={ROUTES.HOME}>
        <Button variant="outline">Về trang chủ</Button>
      </Link>
    </div>
  )
}
