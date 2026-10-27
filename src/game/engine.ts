import { clampToArena, clearance } from './collisions'
import { ACHIEVEMENTS, HEADLINES } from './content'
import { createInput, type InputController } from './input'
import { rescaleObstacles, spawnObstacle, stepObstacle, type ArenaContext } from './obstacles'
import { emitBurst, emitRing, emitSparks, emitTrail, stepParticles } from './particles'
import { createPlayer, resizePlayer, stepPlayer } from './player'
import { Renderer } from './render'
import { loadBest, loadUnlocked, saveBest, saveUnlocked } from './storage'
import type {
  GameHandle,
  GameOptions,
  GamePhase,
  GameSnapshot,
  Obstacle,
  Palette,
  Particle,
  Player,
  Vec2,
} from './types'

/* Tuning --------------------------------------------------------------- */

/** Seconds per difficulty level. */
const LEVEL_SECONDS = 12
/** Max simulation step; larger frames are split into sub-steps so fast obstacles can't tunnel. */
const MAX_SUBSTEP = 1 / 120
/** Frames longer than this (tab switch, GC pause) are clamped rather than simulated. */
const MAX_FRAME = 0.05
const FIRST_SPAWN_DELAY = 0.9
const DYING_SECONDS = 0.8
const NEAR_MISS_U = 2.2

function speedMultiplier(elapsed: number, level: number): number {
  return Math.min(2.7, 1 + (level - 1) * 0.085 + elapsed * 0.0035)
}

function spawnInterval(level: number): number {
  return Math.max(0.3, 1.15 * Math.pow(0.9, level - 1))
}

function pickHeadline(previous: string): string {
  let next = previous
  while (next === previous) next = HEADLINES[Math.floor(Math.random() * HEADLINES.length)]!
  return next
}

/* Engine --------------------------------------------------------------- */

export function createGame(canvas: HTMLCanvasElement, options: GameOptions): GameHandle {
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) throw new Error('Canvas 2D context unavailable')
  const ctx: CanvasRenderingContext2D = context

  let palette: Palette = options.palette
  let reducedMotion = options.reducedMotion
  const renderer = new Renderer(ctx, palette)

  // Arena geometry (CSS px) and the unit used for all tuning.
  let width = Math.max(1, canvas.clientWidth)
  let height = Math.max(1, canvas.clientHeight)
  let unit = Math.min(width, height) / 100

  // Run state
  let phase: GamePhase = 'idle'
  let elapsed = 0
  let level = 1
  let speedMult = 1
  let spawnTimer = FIRST_SPAWN_DELAY
  let dyingTimer = 0
  let shake = 0
  let flash = 0
  let clock = 0
  let trailTimer = 0
  let headline = HEADLINES[0]!
  let best = loadBest()
  let isNewBest = false
  const unlocked = loadUnlocked()

  let player: Player = createPlayer(width, height, unit)
  let dragTarget: Vec2 | null = null
  const obstacles: Obstacle[] = []
  const particles: Particle[] = []

  let raf = 0
  let lastTime = 0
  let destroyed = false
  let lastEmittedScore = -1

  const input: InputController = createInput({
    canvas,
    onAction: (action) => {
      if (action === 'pause') {
        if (phase === 'running') {
          pause()
          return true
        }
        if (phase === 'paused') {
          resume()
          return true
        }
        return false
      }
      // start: only when the game has focus, so Space never hijacks page scrolling.
      const focused = canvas.closest('[data-game-root]')?.contains(document.activeElement) ?? false
      if (phase === 'running') return focused
      if (phase === 'paused') {
        resume()
        return true
      }
      if ((phase === 'idle' || phase === 'over') && focused) {
        start()
        return true
      }
      return false
    },
    shouldCaptureMovement: () => phase === 'running' || phase === 'paused',
  })

  /* Snapshots ----------------------------------------------------------- */

  const score = () => Math.floor(elapsed * 10)

  const snapshot = (): GameSnapshot => ({
    phase,
    score: score(),
    best,
    level,
    speed: Math.round(speedMult * 10) / 10,
    elapsed,
    isNewBest,
    headline,
    touch: input.usedTouch(),
  })

  const emit = () => {
    lastEmittedScore = score()
    options.onSnapshot(snapshot())
  }

  const setPhase = (next: GamePhase) => {
    if (phase === next) return
    phase = next
    canvas.dataset.active = String(next === 'running' || next === 'paused')
    emit()
    ensureLoop() // hoisted function declaration; restarts the loop after an idle stop
  }

  /* Lifecycle ----------------------------------------------------------- */

  function resetRun(): void {
    elapsed = 0
    level = 1
    speedMult = 1
    spawnTimer = FIRST_SPAWN_DELAY
    dyingTimer = 0
    shake = 0
    flash = 0
    trailTimer = 0
    isNewBest = false
    obstacles.length = 0
    particles.length = 0
    player = createPlayer(width, height, unit)
    dragTarget = null
    input.consumeDrag()
  }

  function start(): void {
    if (destroyed) return
    resetRun()
    setPhase('running')
  }

  function pause(): void {
    if (phase !== 'running') return
    setPhase('paused')
  }

  function resume(): void {
    if (phase !== 'paused') return
    input.consumeDrag()
    dragTarget = null
    setPhase('running')
  }

  function togglePause(): void {
    if (phase === 'running') pause()
    else if (phase === 'paused') resume()
  }

  function exit(): void {
    resetRun()
    setPhase('idle')
  }

  function die(hitAt: Vec2): void {
    const burstCount = reducedMotion ? 14 : 46
    emitBurst(particles, player.pos, unit, palette.accent, burstCount, 90, 0.9)
    emitBurst(particles, hitAt, unit, palette.fg, Math.round(burstCount / 3), 60, 0.6)
    emitRing(particles, player.pos, unit, palette.accent, 0.6, 2)
    shake = 1
    flash = reducedMotion ? 0.25 : 0.6
    dyingTimer = DYING_SECONDS
    const s = score()
    if (s > best) {
      best = s
      isNewBest = true
      saveBest(best)
    }
    headline = pickHeadline(headline)
    setPhase('dying')
  }

  function checkAchievements(): void {
    for (const a of ACHIEVEMENTS) {
      if (elapsed >= a.at && !unlocked.has(a.id)) {
        unlocked.add(a.id)
        saveUnlocked(unlocked)
        options.onAchievement(a)
      }
    }
  }

  /* Simulation ---------------------------------------------------------- */

  function arena(): ArenaContext {
    return { width, height, unit, speedMult, level, player: player.pos }
  }

  function simulate(dt: number): void {
    elapsed += dt
    const nextLevel = 1 + Math.floor(elapsed / LEVEL_SECONDS)
    if (nextLevel !== level) {
      level = nextLevel
      emitRing(particles, { x: width / 2, y: height / 2 }, unit, palette.accent, 0.7, 3)
    }
    speedMult = speedMultiplier(elapsed, level)

    // Spawning
    spawnTimer -= dt
    if (spawnTimer <= 0) {
      obstacles.push(spawnObstacle(arena()))
      // Occasionally spawn a pair at higher levels for pressure.
      if (level >= 4 && Math.random() < 0.3) obstacles.push(spawnObstacle(arena()))
      spawnTimer = spawnInterval(level) * (0.75 + Math.random() * 0.5)
    }

    // Player
    const axis = input.axis()
    const drag = input.consumeDrag()
    if (input.isDragging()) {
      if (!dragTarget) dragTarget = { x: player.pos.x, y: player.pos.y }
    } else {
      dragTarget = null
    }
    stepPlayer(player, dt, unit, axis, drag, dragTarget)
    clampToArena(player, width, height)
    if (dragTarget) {
      const half = player.size / 2 + 2
      dragTarget.x = Math.min(Math.max(dragTarget.x, half), width - half)
      dragTarget.y = Math.min(Math.max(dragTarget.y, half), height - half)
    }

    // Trail
    if (!reducedMotion) {
      trailTimer -= dt
      const speed = Math.hypot(player.vel.x, player.vel.y)
      if (trailTimer <= 0 && speed > unit * 12) {
        emitTrail(particles, player.pos, player.vel, unit, palette.accent)
        trailTimer = 0.028
      }
    }

    // Obstacles + collisions
    const ctxArena = arena()
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i]!
      if (!stepObstacle(o, dt, ctxArena)) {
        obstacles.splice(i, 1)
        continue
      }
      if (o.warn > 0) continue
      const c = clearance(player, o)
      if (c <= 0) {
        die(o.pos)
        return
      }
      if (!o.grazed && c < unit * NEAR_MISS_U) {
        o.grazed = true
        if (!reducedMotion) emitSparks(particles, player.pos, unit, palette.fg)
      }
    }

    checkAchievements()
  }

  function update(dt: number): void {
    clock += dt

    if (phase === 'running') {
      const steps = Math.min(8, Math.max(1, Math.ceil(dt / MAX_SUBSTEP)))
      const sub = dt / steps
      for (let i = 0; i < steps && phase === 'running'; i++) simulate(sub)
      if (score() !== lastEmittedScore) emit()
    } else if (phase === 'dying') {
      dyingTimer -= dt
      if (dyingTimer <= 0) setPhase('over')
    }

    stepParticles(particles, dt)
    shake = Math.max(0, shake - dt * 2.4)
    flash = Math.max(0, flash - dt * 2.2)
  }

  function frame(now: number): void {
    if (destroyed) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(MAX_FRAME, Math.max(0, (now - lastTime) / 1000))
    lastTime = now

    update(dt)

    renderer.draw({
      width,
      height,
      unit,
      phase,
      clock,
      player,
      obstacles,
      particles,
      shake,
      flash,
      dragging: input.isDragging(),
      reducedMotion,
    })

    // Nothing moves while idle/paused/over once particles have settled — stop burning frames.
    if ((phase === 'paused' || phase === 'over' || (phase === 'idle' && reducedMotion)) && particles.length === 0) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  function ensureLoop(): void {
    if (raf || destroyed) return
    lastTime = performance.now()
    raf = requestAnimationFrame(frame)
  }

  /* Public surface ------------------------------------------------------ */

  function resize(w: number, h: number, dpr: number): void {
    const nw = Math.max(1, Math.round(w))
    const nh = Math.max(1, Math.round(h))
    const ratio = Math.min(Math.max(dpr || 1, 1), 3)
    canvas.width = Math.round(nw * ratio)
    canvas.height = Math.round(nh * ratio)
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)

    const sx = nw / width
    const sy = nh / height
    const nextUnit = Math.min(nw, nh) / 100
    const su = nextUnit / unit

    width = nw
    height = nh
    unit = nextUnit

    player.pos.x *= sx
    player.pos.y *= sy
    resizePlayer(player, unit)
    if (dragTarget) {
      dragTarget.x *= sx
      dragTarget.y *= sy
    }
    rescaleObstacles(obstacles, sx, sy, su)
    clampToArena(player, width, height)
    renderer.invalidate()
    ensureLoop()
  }

  const handle: GameHandle = {
    start: () => {
      start()
      ensureLoop()
    },
    pause,
    resume: () => {
      resume()
      ensureLoop()
    },
    togglePause: () => {
      togglePause()
      ensureLoop()
    },
    exit: () => {
      exit()
      ensureLoop()
    },
    resize,
    setPalette: (p) => {
      palette = p
      renderer.setPalette(p)
      ensureLoop()
    },
    setReducedMotion: (r) => {
      reducedMotion = r
      ensureLoop()
    },
    getSnapshot: snapshot,
    destroy: () => {
      destroyed = true
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      input.destroy()
    },
  }

  canvas.dataset.active = 'false'
  emit()
  ensureLoop()
  return handle
}
