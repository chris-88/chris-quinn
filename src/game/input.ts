import type { Vec2 } from './types'

export type ActionKey = 'start' | 'pause'

export interface InputController {
  /** Keyboard movement axis, each component in [-1, 1]. */
  axis: () => Vec2
  /** Pointer drag accumulated since the last call, in CSS px. Resets on read. */
  consumeDrag: () => Vec2
  /** Whether a pointer is currently held down on the canvas. */
  isDragging: () => boolean
  /** Whether any touch has been used on the canvas. */
  usedTouch: () => boolean
  destroy: () => void
}

interface InputOptions {
  canvas: HTMLCanvasElement
  /** Called for Space/Enter (start) and Escape (pause). Return true to preventDefault. */
  onAction: (action: ActionKey, event: KeyboardEvent) => boolean
  /** Whether movement keys should be captured (and page scrolling prevented) right now. */
  shouldCaptureMovement: () => boolean
}

const MOVE_KEYS: Record<string, keyof typeof KEY_AXIS> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
}

const KEY_AXIS = { up: 0, down: 0, left: 0, right: 0 }

export function createInput({ canvas, onAction, shouldCaptureMovement }: InputOptions): InputController {
  const held = new Set<keyof typeof KEY_AXIS>()
  let drag: Vec2 = { x: 0, y: 0 }
  let activePointer: number | null = null
  let last: Vec2 = { x: 0, y: 0 }
  let touched = false

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return

    if (e.key === ' ' || e.key === 'Enter') {
      if (onAction('start', e)) e.preventDefault()
      return
    }
    if (e.key === 'Escape') {
      if (onAction('pause', e)) e.preventDefault()
      return
    }
    const dir = MOVE_KEYS[e.key]
    if (dir && shouldCaptureMovement()) {
      held.add(dir)
      e.preventDefault()
    }
  }

  const onKeyUp = (e: KeyboardEvent) => {
    const dir = MOVE_KEYS[e.key]
    if (dir) held.delete(dir)
  }

  const onBlur = () => held.clear()

  const onPointerDown = (e: PointerEvent) => {
    if (activePointer !== null) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    activePointer = e.pointerId
    last = { x: e.clientX, y: e.clientY }
    if (e.pointerType !== 'mouse') touched = true
    try {
      canvas.setPointerCapture(e.pointerId)
    } catch {
      /* capture unsupported — fine */
    }
  }

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerId !== activePointer) return
    drag = { x: drag.x + (e.clientX - last.x), y: drag.y + (e.clientY - last.y) }
    last = { x: e.clientX, y: e.clientY }
  }

  const endPointer = (e: PointerEvent) => {
    if (e.pointerId !== activePointer) return
    activePointer = null
    try {
      canvas.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', endPointer)
  canvas.addEventListener('pointercancel', endPointer)

  return {
    axis: () => ({
      x: (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0),
      y: (held.has('down') ? 1 : 0) - (held.has('up') ? 1 : 0),
    }),
    consumeDrag: () => {
      const d = drag
      drag = { x: 0, y: 0 }
      return d
    },
    isDragging: () => activePointer !== null,
    usedTouch: () => touched,
    destroy: () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', endPointer)
      canvas.removeEventListener('pointercancel', endPointer)
    },
  }
}
