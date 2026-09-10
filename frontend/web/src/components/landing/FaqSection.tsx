import { useState } from 'react'
import { NavIcon } from '@/components/layout'
import { FAQS } from '@/constants'
import { cn } from '@/utils'
import { Reveal } from './Reveal'

/** Câu hỏi thường gặp dạng accordion, mở một mục tại một thời điểm */
export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="bg-surface-muted/50 scroll-mt-20 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <span className="text-secondary text-xs font-bold tracking-[0.2em] uppercase">
              Câu hỏi thường gặp
            </span>
            <h2 className="text-primary mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Những điều bạn nên biết trước
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <Reveal key={f.q} delay={i * 60}>
                <div
                  className={cn(
                    'bg-surface overflow-hidden rounded-2xl border transition',
                    isOpen ? 'border-secondary/40 shadow-sm' : 'border-neutral-200',
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left"
                    >
                      <span className="font-heading text-primary min-w-0 flex-1 text-base font-semibold">
                        {f.q}
                      </span>
                      <span
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-lg transition',
                          isOpen
                            ? 'bg-secondary rotate-180 text-white'
                            : 'bg-secondary-50 text-secondary',
                        )}
                      >
                        <NavIcon name="chevron-down" className="size-4" />
                      </span>
                    </button>
                  </h3>
                  <div
                    className={cn(
                      'grid transition-all duration-300 ease-out',
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm leading-relaxed text-neutral-600">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
