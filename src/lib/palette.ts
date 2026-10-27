import type { Palette } from '@/game/types'

const FALLBACK: Palette = {
  bg: '#0b0f14',
  surface: '#141a22',
  surface2: '#1a222c',
  fg: '#f2f4f7',
  muted: '#8993a4',
  faint: '#5b6473',
  line: '#232b36',
  lineStrong: '#2f3946',
  accent: '#a3e635',
  danger: '#fb7185',
}

/** Read the live theme tokens so the canvas follows the page (including retro mode). */
export function readPalette(): Palette {
  if (typeof window === 'undefined') return FALLBACK
  const css = getComputedStyle(document.documentElement)
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
  return {
    bg: v('--color-bg', FALLBACK.bg),
    surface: v('--color-surface', FALLBACK.surface),
    surface2: v('--color-surface-2', FALLBACK.surface2),
    fg: v('--color-fg', FALLBACK.fg),
    muted: v('--color-muted', FALLBACK.muted),
    faint: v('--color-faint', FALLBACK.faint),
    line: v('--color-line', FALLBACK.line),
    lineStrong: v('--color-line-strong', FALLBACK.lineStrong),
    accent: v('--color-accent', FALLBACK.accent),
    danger: v('--color-danger', FALLBACK.danger),
  }
}
