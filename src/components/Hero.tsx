import { ArrowDown } from 'lucide-react'

import { site } from '@/config/site'

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden px-5 pt-[max(4.5rem,env(safe-area-inset-top))] pb-16 sm:pt-28 sm:pb-24"
    >
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto w-full max-w-3xl">
        <p className="animate-rise flex items-center gap-2 font-mono text-[0.72rem] font-medium tracking-[0.18em] text-muted uppercase">
          <span aria-hidden="true" className="animate-pulse-dot inline-block size-2 rounded-full bg-accent" />
          <span>
            <span className="sr-only">Status: </span>System online
          </span>
        </p>

        <h1
          id="hero-heading"
          className="animate-rise mt-7 text-balance text-[clamp(2.75rem,9vw,5.25rem)] leading-[0.98] font-semibold tracking-[-0.035em] text-fg [animation-delay:60ms]"
        >
          Hello, internet.
        </h1>

        <div className="animate-rise mt-8 max-w-[38rem] space-y-5 text-pretty text-[1.05rem] leading-relaxed text-muted sm:text-lg [animation-delay:120ms]">
          <p>
            I’m Chris. I like building things, figuring out how stuff works, and seeing what happens when an
            idea becomes code.
          </p>
          <p>
            This is my little corner of the internet. Mostly experiments, prototypes, half-finished ideas and the
            occasional thing that actually works.
          </p>
        </div>

        <p className="animate-rise mt-10 flex flex-wrap items-center gap-x-4 gap-y-3 font-mono text-sm text-faint [animation-delay:180ms]">
          <span className="inline-flex items-center">
            <span className="text-accent/80">➜</span>
            <span className="ml-2 text-muted">{site.path}</span>
            <span aria-hidden="true" className="animate-blink ml-1 inline-block h-[1.05em] w-[0.55em] translate-y-[2px] bg-accent/90" />
          </span>
          <a
            href="#game"
            className="group inline-flex items-center gap-1.5 rounded text-faint transition-colors hover:text-fg"
          >
            there’s a game
            <ArrowDown aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-y-0.5" />
          </a>
        </p>
      </div>
    </section>
  )
}
