import { Gamepad2, Keyboard, Pause, Play, Pointer, RotateCcw, Undo2 } from 'lucide-react'
import { forwardRef, useImperativeHandle } from 'react'

import { Button } from '@/components/ui/button'
import { useGame } from '@/hooks/useGame'
import { useCoarsePointer } from '@/hooks/useMediaQuery'
import { cn, padScore } from '@/lib/utils'

export interface GameSectionHandle {
  /** Scroll the game into view and start a run. Used by the footer command line. */
  play: () => void
}

export const GameSection = forwardRef<GameSectionHandle>(function GameSection(_, ref) {
  const { canvasRef, rootRef, snapshot, supported, start, resume, pause, exit } = useGame()
  const coarse = useCoarsePointer()
  const { phase } = snapshot
  const showTouchHint = coarse || snapshot.touch

  useImperativeHandle(ref, () => ({
    play: () => {
      rootRef.current?.scrollIntoView({ block: 'center' })
      window.setTimeout(start, 350)
    },
  }))

  const backToReality = () => {
    exit()
    window.scrollTo({ top: 0 })
  }

  return (
    <section id="game" aria-labelledby="game-heading" className="scroll-mt-10 px-5 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <header className="max-w-[36rem]">
          <p className="font-mono text-[0.72rem] tracking-[0.18em] text-faint uppercase">A small distraction</p>
          <h2 id="game-heading" className="mt-3 text-balance text-3xl font-semibold tracking-[-0.025em] text-fg sm:text-4xl">
            Since you’re here…
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted">
            You could leave. Or you could try beating my high score.
          </p>
        </header>

        {/* HUD */}
        <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-t-xl border border-b-0 border-line bg-line">
          <Stat label="Score" value={padScore(snapshot.score)} />
          <Stat
            label={
              <>
                <span className="sm:hidden">Best</span>
                <span className="hidden sm:inline">Personal best</span>
              </>
            }
            value={padScore(snapshot.best)}
            accent={snapshot.isNewBest && (phase === 'over' || phase === 'dying')}
          />
          <Stat label="Speed" value={`${snapshot.speed.toFixed(1)}×`} sub={`LVL ${snapshot.level}`} />
        </dl>

        {/* Arena */}
        <div
          ref={rootRef}
          data-game-root
          tabIndex={-1}
          aria-label="One More Run — the game arena"
          className="relative overflow-hidden rounded-b-xl border border-line bg-bg outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <div className="h-[min(68svh,540px)] sm:h-auto sm:aspect-[16/9]">
            <canvas ref={canvasRef} className="game-canvas" aria-hidden="true" />
          </div>

          {!supported && (
            <Overlay>
              <p className="font-mono text-xs tracking-[0.18em] text-faint uppercase">Game unavailable</p>
              <p className="mt-3 max-w-xs text-sm text-muted">
                Your browser couldn’t start the canvas. The rest of the page still works, which is more than I can
                say for most of my experiments.
              </p>
            </Overlay>
          )}

          {supported && phase === 'idle' && (
            <Overlay>
              <p className="flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-accent uppercase">
                <Gamepad2 aria-hidden="true" className="size-4" />
                One more run
              </p>
              <p className="mt-3 max-w-xs text-pretty text-sm text-muted">
                Dodge everything. Survive as long as you can. It gets faster. It always gets faster.
              </p>
              <ul className="mt-5 space-y-1.5 font-mono text-[0.72rem] text-faint">
                {showTouchHint ? (
                  <li className="flex items-center justify-center gap-2">
                    <Pointer aria-hidden="true" className="size-3.5" />
                    Drag anywhere on the arena to move
                  </li>
                ) : (
                  <>
                    <li className="flex items-center justify-center gap-2">
                      <Keyboard aria-hidden="true" className="size-3.5" />
                      <Key>↑↓←→</Key> or <Key>WASD</Key> to move
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <Key>Space</Key> start · <Key>Esc</Key> pause
                    </li>
                  </>
                )}
              </ul>
              <Button size="lg" onClick={start} className="mt-7 min-w-48">
                [ Start game ]
              </Button>
            </Overlay>
          )}

          {supported && phase === 'paused' && (
            <Overlay>
              <p className="flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-muted uppercase">
                <Pause aria-hidden="true" className="size-4" />
                Paused
              </p>
              <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-fg">{padScore(snapshot.score)}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={resume}>
                  <Play aria-hidden="true" className="size-4" />
                  Resume
                </Button>
                <Button variant="outline" onClick={backToReality}>
                  Quit run
                </Button>
              </div>
              {!showTouchHint && (
                <p className="mt-4 font-mono text-[0.7rem] text-faint">
                  <Key>Esc</Key> or <Key>Space</Key> to resume
                </p>
              )}
            </Overlay>
          )}

          {supported && phase === 'over' && (
            <Overlay>
              <p className="font-mono text-xs tracking-[0.18em] text-faint uppercase">Run over</p>
              <h3 className="mt-2 text-balance text-2xl font-semibold tracking-[-0.02em] text-fg sm:text-3xl">
                {snapshot.headline}
              </h3>
              <dl className="mt-6 grid grid-cols-2 gap-6 font-mono">
                <div>
                  <dt className="text-[0.68rem] tracking-[0.18em] text-faint uppercase">Score</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-fg">{padScore(snapshot.score)}</dd>
                </div>
                <div>
                  <dt className="text-[0.68rem] tracking-[0.18em] text-faint uppercase">Personal best</dt>
                  <dd
                    className={cn(
                      'mt-1 flex items-baseline justify-center gap-2 text-2xl font-semibold tabular-nums',
                      snapshot.isNewBest ? 'text-accent' : 'text-fg',
                    )}
                  >
                    {padScore(snapshot.best)}
                    {snapshot.isNewBest && (
                      <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[0.6rem] tracking-[0.18em] text-accent uppercase">
                        new
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button onClick={start} autoFocus>
                  <RotateCcw aria-hidden="true" className="size-4" />
                  Try again
                </Button>
                <Button variant="outline" onClick={backToReality}>
                  <Undo2 aria-hidden="true" className="size-4" />
                  Back to reality
                </Button>
              </div>
              <p className="mt-5 font-mono text-[0.68rem] text-faint">
                Personal best is stored in this browser only. No leaderboard, no servers, no excuses.
              </p>
            </Overlay>
          )}

          {supported && phase === 'running' && !showTouchHint && (
            <button
              type="button"
              onClick={pause}
              aria-label="Pause game"
              className="absolute top-3 right-3 rounded-md border border-line bg-bg/70 p-1.5 text-faint backdrop-blur transition-colors hover:text-fg"
            >
              <Pause aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>

        <p className="mt-3 font-mono text-[0.7rem] text-faint">
          {showTouchHint
            ? 'Tip: your finger doesn’t need to be on the square. Drag anywhere.'
            : 'Tip: the warning ticks on the edges show where the next obstacle enters.'}
        </p>
      </div>
    </section>
  )
})

function Stat({
  label,
  value,
  sub,
  accent = false,
}: {
  label: React.ReactNode
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div className="bg-surface px-3 py-3 sm:px-5">
      <dt className="font-mono text-[0.62rem] tracking-[0.18em] text-faint uppercase sm:text-[0.68rem]">{label}</dt>
      <dd
        className={cn(
          'mt-1 flex items-baseline gap-2 font-mono text-lg font-semibold tabular-nums sm:text-2xl',
          accent ? 'text-accent' : 'text-fg',
        )}
      >
        {value}
        {sub && <span className="text-[0.65rem] font-medium tracking-[0.14em] text-faint">{sub}</span>}
      </dd>
    </div>
  )
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg/80 px-6 text-center backdrop-blur-[2px]">
      <div className="animate-rise">{children}</div>
    </div>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-line-strong bg-surface px-1.5 py-0.5 font-mono text-[0.68rem] text-muted">
      {children}
    </kbd>
  )
}
