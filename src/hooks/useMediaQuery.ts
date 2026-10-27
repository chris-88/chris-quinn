import { useCallback, useSyncExternalStore } from 'react'

const canQuery = () => typeof window !== 'undefined' && 'matchMedia' in window

export function matchesMedia(query: string, fallback = false): boolean {
  return canQuery() ? window.matchMedia(query).matches : fallback
}

export function useMediaQuery(query: string, fallback = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!canQuery()) return () => {}
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    [query],
  )
  const getSnapshot = useCallback(() => matchesMedia(query, fallback), [query, fallback])
  const getServerSnapshot = useCallback(() => fallback, [fallback])
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
export const useReducedMotion = () => useMediaQuery(REDUCED_MOTION_QUERY)
export const useCoarsePointer = () => useMediaQuery('(pointer: coarse)')
