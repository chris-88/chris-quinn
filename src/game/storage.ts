/**
 * Tiny localStorage wrapper that never throws. Private mode, blocked storage,
 * and server rendering all fall back to in-memory values for the session.
 */
const PREFIX = 'omr:'
const memory = new Map<string, string>()

function read(key: string): string | null {
  try {
    const value = window.localStorage.getItem(PREFIX + key)
    if (value !== null) return value
  } catch {
    /* storage unavailable */
  }
  return memory.get(key) ?? null
}

function write(key: string, value: string): void {
  memory.set(key, value)
  try {
    window.localStorage.setItem(PREFIX + key, value)
  } catch {
    /* storage unavailable — memory fallback already holds the value */
  }
}

export function loadBest(): number {
  const raw = read('best')
  const n = raw === null ? 0 : Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export function saveBest(score: number): void {
  write('best', String(Math.floor(score)))
}

export function loadUnlocked(): Set<string> {
  const raw = read('achievements')
  if (!raw) return new Set()
  try {
    const parsed: unknown = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

export function saveUnlocked(ids: Set<string>): void {
  write('achievements', JSON.stringify([...ids]))
}

export function loadFlag(key: string): boolean {
  return read(key) === '1'
}

export function saveFlag(key: string, on: boolean): void {
  write(key, on ? '1' : '0')
}
