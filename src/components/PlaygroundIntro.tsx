import { FlaskConical, Hammer, Rocket, type LucideIcon } from 'lucide-react'

interface Card {
  label: string
  copy: string
  command: string
  Icon: LucideIcon
}

const CARDS: readonly Card[] = [
  { label: 'Build', copy: 'Ideas worth trying.', command: 'make build', Icon: Hammer },
  { label: 'Break', copy: 'Experiments in progress.', command: 'make break', Icon: FlaskConical },
  { label: 'Ship', copy: 'The occasional happy accident.', command: 'make ship', Icon: Rocket },
]

export function PlaygroundIntro() {
  return (
    <section aria-labelledby="intro-heading" className="px-5 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="overflow-hidden rounded-xl border border-line bg-surface/70 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_30px_60px_-40px_rgba(0,0,0,0.8)]">
          {/* Title bar */}
          <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
            <div aria-hidden="true" className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
            </div>
            <p className="font-mono text-[0.7rem] tracking-wider text-faint">README.md</p>
          </div>

          <div className="p-5 sm:p-8">
            <h2 id="intro-heading" className="text-balance text-2xl font-semibold tracking-[-0.02em] text-fg sm:text-3xl">
              A playground, not a portfolio.
            </h2>
            <p className="mt-3 max-w-[36rem] text-pretty leading-relaxed text-muted">
              Some things here are useful. Some are unfinished. Others exist simply because I wanted to see if I
              could build them.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-3">
              {CARDS.map(({ label, copy, command, Icon }) => (
                <li key={label}>
                  <article
                    tabIndex={0}
                    className="group relative h-full rounded-lg border border-line bg-bg/60 p-4 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_0_0_1px_rgba(163,230,53,0.15),0_18px_30px_-24px_rgba(163,230,53,0.45)] focus-visible:border-accent/60 motion-reduce:hover:translate-y-0"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono text-xs font-semibold tracking-[0.2em] text-fg uppercase">{label}</h3>
                      <Icon
                        aria-hidden="true"
                        className="size-4 text-faint transition-[color,transform] duration-200 group-hover:-rotate-6 group-hover:text-accent group-focus-visible:text-accent motion-reduce:group-hover:rotate-0"
                      />
                    </div>
                    <p className="mt-2 text-sm text-muted">{copy}</p>
                    <p
                      aria-hidden="true"
                      className="mt-4 font-mono text-[0.7rem] text-faint transition-colors group-hover:text-muted"
                    >
                      <span className="text-accent/70">$</span> {command}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
