import type { Particle, Vec2 } from './types'

const MAX_PARTICLES = 420

const rand = (min: number, max: number) => min + Math.random() * (max - min)

export function stepParticles(list: Particle[], dt: number): void {
  let write = 0
  for (let i = 0; i < list.length; i++) {
    const p = list[i]!
    p.life -= dt
    if (p.life <= 0) continue
    const f = Math.exp(-p.drag * dt)
    p.vel.x *= f
    p.vel.y *= f
    p.pos.x += p.vel.x * dt
    p.pos.y += p.vel.y * dt
    list[write++] = p
  }
  list.length = write
}

function push(list: Particle[], p: Particle): void {
  if (list.length >= MAX_PARTICLES) list.shift()
  list.push(p)
}

/** Radial burst — used for death and level-ups. */
export function emitBurst(
  list: Particle[],
  at: Vec2,
  unit: number,
  color: string,
  count: number,
  speedU: number,
  life = 0.8,
): void {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    const s = unit * speedU * rand(0.35, 1)
    push(list, {
      pos: { x: at.x, y: at.y },
      vel: { x: Math.cos(a) * s, y: Math.sin(a) * s },
      life: life * rand(0.5, 1),
      maxLife: life,
      size: unit * rand(0.7, 1.9),
      color,
      shape: 0,
      drag: 2.8,
    })
  }
}

/** A single expanding ring (level up, near miss). */
export function emitRing(list: Particle[], at: Vec2, unit: number, color: string, life = 0.5, size = 1): void {
  push(list, {
    pos: { x: at.x, y: at.y },
    vel: { x: 0, y: 0 },
    life,
    maxLife: life,
    size: unit * size,
    color,
    shape: 1,
    drag: 0,
  })
}

/** Small fading squares left behind a moving player. */
export function emitTrail(list: Particle[], at: Vec2, vel: Vec2, unit: number, color: string): void {
  push(list, {
    pos: { x: at.x + rand(-unit * 0.4, unit * 0.4), y: at.y + rand(-unit * 0.4, unit * 0.4) },
    vel: { x: -vel.x * 0.08, y: -vel.y * 0.08 },
    life: 0.32,
    maxLife: 0.32,
    size: unit * 1.6,
    color,
    shape: 0,
    drag: 6,
  })
}

/** Sparks for a near miss. */
export function emitSparks(list: Particle[], at: Vec2, unit: number, color: string): void {
  for (let i = 0; i < 5; i++) {
    const a = Math.random() * Math.PI * 2
    const s = unit * rand(14, 26)
    push(list, {
      pos: { x: at.x, y: at.y },
      vel: { x: Math.cos(a) * s, y: Math.sin(a) * s },
      life: rand(0.18, 0.32),
      maxLife: 0.32,
      size: unit * 0.7,
      color,
      shape: 0,
      drag: 5,
    })
  }
}
