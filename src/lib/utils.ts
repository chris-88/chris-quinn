import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Zero-pad a score to a fixed width: 248 -> "0248". */
export function padScore(n: number, width = 4): string {
  return Math.max(0, Math.floor(n)).toString().padStart(width, '0')
}

/** Pick a random element. */
export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}
