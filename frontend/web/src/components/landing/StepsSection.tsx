import { NavIcon } from '@/components/layout'
import { STEPS } from '@/constants'
import { Reveal } from './Reveal'

/** Ba bước bắt đầu, nối bằng đường kẻ mảnh trên desktop */
export function StepsSection() {
  return (
    <section id="how" className="bg-surface-muted/50 scroll-mt-20 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-secondary text-xs font-bold tracking-[0.2em] uppercase">
              Cách hoạt động
            </span>
            <h2 className="text-primary mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Ba bước, chưa tới hai phút
            </h2>
          </div>
        </Reveal>

        <div className="relative mt-12">
          <span
            aria-hidden
            className="absolute top-7 right-[16%] left-[16%] hidden border-t-2 border-dashed border-neutral-300 lg:block"
          />
          <ol className="relative grid gap-8 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <li className="flex flex-col items-center text-center">
                  <span className="bg-surface border-secondary/30 text-secondary relative flex size-14 items-center justify-center rounded-2xl border-2 shadow-sm">
                    <NavIcon name={s.icon} className="size-6" />
                    <span className="bg-primary absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                  </span>
                  <h3 className="text-primary mt-5 text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-neutral-600">{s.desc}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
