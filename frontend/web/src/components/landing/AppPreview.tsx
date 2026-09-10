import { NavIcon, type NavIconName } from '@/components/layout'

interface Stat {
  icon: NavIconName
  label: string
  value: string
  unit?: string
}

const STATS: Stat[] = [
  { icon: 'heart', label: 'Nhịp tim', value: '72', unit: 'bpm' },
  { icon: 'moon', label: 'Giấc ngủ', value: '7.2', unit: 'giờ' },
]

/** Ảnh minh họa sản phẩm dựng bằng chính UI của app: khung chat + thẻ chỉ số + thẻ thời tiết */
export function AppPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      {/* Quầng sáng phía sau, vẽ bằng gradient */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-10 bg-[radial-gradient(18rem_14rem_at_85%_5%,rgba(92,201,197,0.28),transparent_70%),radial-gradient(18rem_14rem_at_10%_95%,rgba(95,179,228,0.24),transparent_70%)]"
      />

      {/* Khung chat */}
      <div className="bg-surface relative rounded-[1.75rem] border border-neutral-200/80 p-4 shadow-[0_32px_64px_-28px_rgba(11,37,69,0.45)]">
        <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
          <span className="bg-primary text-secondary-300 flex size-9 items-center justify-center rounded-xl">
            <NavIcon name="chat" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-heading text-primary text-sm font-bold">Trợ lý sức khỏe AI</p>
            <p className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <span className="bg-secondary size-1.5 rounded-full" aria-hidden />
              Đang trực tuyến
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <div className="flex justify-end">
            <p className="bg-primary max-w-[80%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm text-white">
              Tôi hay đau đầu buổi chiều, nên ăn gì?
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="bg-primary text-secondary-300 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl">
              <NavIcon name="chat" className="size-4" />
            </span>
            <div className="bg-surface-muted/70 min-w-0 flex-1 rounded-2xl rounded-tl-md px-3.5 py-3">
              <span className="bg-secondary-50 text-secondary-700 mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold">
                Đánh giá sơ bộ
              </span>
              <p className="text-[13px] leading-relaxed text-neutral-700">
                Trời Hà Nội đang nóng ẩm và bạn có tăng huyết áp, mình gợi ý bữa xế nhẹ, ít muối và
                uống đủ nước nhé.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {['Canh bí đỏ nấu tôm', 'Sữa chua & chuối'].map((m) => (
                  <div
                    key={m}
                    className="bg-surface rounded-xl border border-neutral-200 px-2.5 py-2"
                  >
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-800">
                      <NavIcon name="food" className="text-secondary size-3.5 shrink-0" />
                      <span className="truncate">{m}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-neutral-200 p-2">
          <span className="flex size-8 items-center justify-center rounded-lg text-neutral-400">
            <NavIcon name="image" className="size-4" />
          </span>
          <span className="flex-1 text-[13px] text-neutral-400">
            Mô tả triệu chứng hoặc gửi ảnh…
          </span>
          <span className="bg-primary flex size-8 items-center justify-center rounded-lg text-white">
            <NavIcon name="send" className="size-4" />
          </span>
        </div>
      </div>

      {/* Thẻ chỉ số nổi bên trái */}
      <div className="bg-surface-cream absolute -bottom-8 -left-4 hidden gap-3 rounded-2xl border border-neutral-200/80 p-3 shadow-[0_20px_40px_-20px_rgba(11,37,69,0.45)] sm:flex md:-left-10">
        {STATS.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 px-1">
            <span className="bg-secondary-50 text-secondary flex size-9 items-center justify-center rounded-xl">
              <NavIcon name={s.icon} className="size-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-neutral-500 uppercase">
                {s.label}
              </p>
              <p className="font-heading text-primary text-base font-bold">
                {s.value} <span className="text-[11px] font-medium text-neutral-500">{s.unit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Thẻ thời tiết nổi góc trên phải */}
      <div className="from-primary to-tertiary-700 absolute -top-6 -right-2 hidden items-center gap-2.5 rounded-2xl bg-linear-to-br px-3.5 py-2.5 text-white shadow-[0_20px_40px_-18px_rgba(11,37,69,0.6)] sm:flex md:-right-8">
        <NavIcon name="weather" className="size-6" />
        <div>
          <p className="font-heading text-lg leading-none font-bold">30°</p>
          <p className="text-[10px] text-white/75">Hà Nội · AQI 3/5</p>
        </div>
      </div>
    </div>
  )
}
