import { useSyncExternalStore } from 'react'

export interface Toast {
  id: number
  title: string
  detail?: string
  /** Visual flavour; 'achievement' gets the lime treatment. */
  kind: 'achievement' | 'info'
}

type Listener = () => void

let toasts: readonly Toast[] = []
let nextId = 1
const listeners = new Set<Listener>()
const timers = new Map<number, ReturnType<typeof setTimeout>>()

function publish() {
  for (const l of listeners) l()
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => toasts

export function dismissToast(id: number): void {
  const t = timers.get(id)
  if (t) clearTimeout(t)
  timers.delete(id)
  toasts = toasts.filter((x) => x.id !== id)
  publish()
}

export function toast(title: string, detail?: string, kind: Toast['kind'] = 'info', duration = 4800): void {
  const id = nextId++
  toasts = [...toasts.slice(-2), { id, title, detail, kind }]
  publish()
  timers.set(
    id,
    setTimeout(() => dismissToast(id), duration),
  )
}

export function useToasts(): readonly Toast[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
