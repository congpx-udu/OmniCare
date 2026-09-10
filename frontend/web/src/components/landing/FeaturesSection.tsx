import { NavIcon } from '@/components/layout'
import { FEATURES } from '@/constants'
import { cn } from '@/utils'
import { Reveal } from './Reveal'

/** Lưới tính năng kiểu bento: một thẻ lớn + bốn thẻ nhỏ */
export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-secondary text-xs font-bold tracking-[0.2em] uppercase">
              Tính năng
            </span>
            <h2 className="text-primary mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Năm việc bạn vẫn làm rải rác, gộp vào một chỗ
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal
              key={f.title}
              delay={i * 70}
              className={cn(f.wide && 'sm:col-span-2 lg:row-span-2')}
            >
              <article
                className={cn(
                  'group h-full rounded-[1.5rem] border p-6 transition duration-300',
                  f.wide
                    ? 'from-primary via-primary-700 to-secondary-700 relative overflow-hidden border-transparent bg-linear-to-br text-white'
                    : 'bg-surface hover:border-secondary/40 border-neutral-200 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(11,37,69,0.4)]',
                )}
              >
                {f.wide && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(20rem_16rem_at_95%_0%,rgba(92,201,197,0.28),transparent_65%)]"
                  />
                )}
                <span
                  className={cn(
                    'relative flex items-center justify-center rounded-2xl transition',
                    f.wide
                      ? 'size-14 bg-white/15 text-white backdrop-blur'
                      : 'bg-secondary-50 text-secondary group-hover:bg-secondary size-12 group-hover:text-white',
                  )}
                >
                  <NavIcon name={f.icon} className={f.wide ? 'size-7' : 'size-6'} />
                </span>
                <h3
                  className={cn(
                    'relative mt-5 font-bold',
                    f.wide ? 'text-2xl text-white sm:text-3xl' : 'text-primary text-lg',
                  )}
                >
                  {f.title}
                </h3>
                <p
                  className={cn(
                    'relative mt-2 leading-relaxed',
                    f.wide ? 'max-w-md text-white/80' : 'text-sm text-neutral-600',
                  )}
                >
                  {f.desc}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
