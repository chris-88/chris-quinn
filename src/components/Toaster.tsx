import { Trophy, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { dismissToast, useToasts } from '@/lib/toast'

export function Toaster() {
  const toasts = useToasts()
  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'animate-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-surface/95 px-4 py-3 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur',
            t.kind === 'achievement' ? 'border-accent/50' : 'border-line-strong',
          )}
        >
          {t.kind === 'achievement' && (
            <Trophy aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[0.7rem] tracking-[0.16em] text-faint uppercase">
              {t.kind === 'achievement' ? 'Achievement unlocked' : 'System message'}
            </p>
            <p className="mt-0.5 text-sm font-medium text-fg">{t.title}</p>
            {t.detail && <p className="mt-0.5 text-sm text-muted">{t.detail}</p>}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
            className="-mr-1 -mt-1 rounded p-1 text-faint transition-colors hover:text-fg"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
