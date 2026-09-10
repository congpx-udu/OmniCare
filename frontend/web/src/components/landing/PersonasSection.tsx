import { NavIcon } from '@/components/layout'
import { PERSONAS } from '@/constants'
import { Reveal } from './Reveal'

/** Ba nhóm người dùng OmniCare phục vụ */
export function PersonasSection() {
  return (
    <section id="personas" className="scroll-mt-20 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-secondary text-xs font-bold tracking-[0.2em] uppercase">
              Dành cho ai
            </span>
            <h2 className="text-primary mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Hợp với người muốn hiểu cơ thể mình hơn
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PERSONAS.map((p, i) => (
            <Reveal key={p.name} delay={i * 90}>
              <article className="bg-surface group relative h-full overflow-hidden rounded-[1.5rem] border border-neutral-200 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(11,37,69,0.4)]">
                <span
                  aria-hidden
                  className="bg-secondary-50 absolute -top-10 -right-10 size-32 rounded-full transition duration-500 group-hover:scale-150"
                />
                <span className="bg-primary text-secondary-300 relative flex size-12 items-center justify-center rounded-2xl">
                  <NavIcon name={p.icon} className="size-6" />
                </span>
                <h3 className="text-primary relative mt-5 text-lg font-bold">{p.name}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-neutral-600">{p.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
