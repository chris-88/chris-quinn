import { useCallback, useEffect, useRef, useState } from 'react'

import { createGame } from '@/game/engine'
import type { Achievement, GameHandle, GameSnapshot } from '@/game/types'
import { readPalette } from '@/lib/palette'
import { toast } from '@/lib/toast'
import { matchesMedia, REDUCED_MOTION_QUERY, useReducedMotion } from './useMediaQuery'

const INITIAL: GameSnapshot = {
  phase: 'idle',
  score: 0,
  best: 0,
  level: 1,
  speed: 1,
  elapsed: 0,
  isNewBest: false,
  headline: '',
  touch: false,
}

export function useGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<GameHandle | null>(null)
  const [snapshot, setSnapshot] = useState<GameSnapshot>(INITIAL)
  const [supported, setSupported] = useState(true)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let handle: GameHandle
    try {
      handle = createGame(canvas, {
        palette: readPalette(),
        reducedMotion: matchesMedia(REDUCED_MOTION_QUERY),
        onSnapshot: setSnapshot,
        onAchievement: (a: Achievement) => toast(a.title, a.detail, 'achievement', 6000),
      })
    } catch {
      // Deferred so the failure path doesn't trigger a render inside the effect.
      const id = window.setTimeout(() => setSupported(false), 0)
      return () => window.clearTimeout(id)
    }
    handleRef.current = handle

    const fit = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) handle.resize(rect.width, rect.height, window.devicePixelRatio || 1)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)

    const onVisibility = () => {
      if (document.hidden) handle.pause()
    }
    const onBlur = () => handle.pause()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)

    // Follow theme changes (Konami retro mode swaps the CSS tokens).
    const mo = new MutationObserver(() => handle.setPalette(readPalette()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })

    return () => {
      ro.disconnect()
      mo.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      handle.destroy()
      handleRef.current = null
    }
  }, [])

  useEffect(() => {
    handleRef.current?.setReducedMotion(reducedMotion)
  }, [reducedMotion])

  const focusGame = useCallback(() => {
    rootRef.current?.focus({ preventScroll: true })
  }, [])

  const start = useCallback(() => {
    focusGame()
    handleRef.current?.start()
  }, [focusGame])

  const resume = useCallback(() => {
    focusGame()
    handleRef.current?.resume()
  }, [focusGame])

  const pause = useCallback(() => handleRef.current?.pause(), [])
  const exit = useCallback(() => handleRef.current?.exit(), [])

  return { canvasRef, rootRef, snapshot, supported, start, resume, pause, exit }
}
