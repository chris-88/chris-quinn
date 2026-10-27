import { loadFlag, saveFlag } from '@/game/storage'
import { toast } from '@/lib/toast'

const THEME = 'retro'

export function isRetro(): boolean {
  return document.documentElement.dataset.theme === THEME
}

export function setRetro(on: boolean, announce = true): void {
  const root = document.documentElement
  if (on) {
    root.dataset.theme = THEME
    root.classList.add('scanlines')
  } else {
    delete root.dataset.theme
    root.classList.remove('scanlines')
  }
  saveFlag('retro', on)
  if (announce) {
    if (on) toast('RETRO MODE ENGAGED', '30 extra lives granted. (Not really.)', 'info')
    else toast('Back to the future', 'Modern mode restored.', 'info')
  }
}

export function toggleRetro(): void {
  setRetro(!isRetro())
}

/** Re-apply a previously chosen retro mode before first paint. */
export function restoreRetro(): void {
  if (loadFlag('retro')) setRetro(true, false)
}
