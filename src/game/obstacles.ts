import type { Obstacle, ObstacleKind, Vec2 } from './types'

export interface ArenaContext {
  width: number
  height: number
  unit: number
  speedMult: number
  level: number
  player: Vec2
}

let nextId = 1

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const chance = (p: number) => Math.random() < p

type Edge = 0 | 1 | 2 | 3 // top, right, bottom, left

function pickKind(level: number): ObstacleKind {
  const r = Math.random()
  if (level >= 3 && r < 0.22) return 'seeker'
  if (level >= 2 && r < 0.42) return 'bar'
  return 'block'
}

function edgeNormal(edge: Edge): Vec2 {
  switch (edge) {
    case 0:
      return { x: 0, y: 1 }
    case 1:
      return { x: -1, y: 0 }
    case 2:
      return { x: 0, y: -1 }
    default:
      return { x: 1, y: 0 }
  }
}

function rotate(v: Vec2, angle: number): Vec2 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c }
}

function normalize(v: Vec2): Vec2 {
  const len = Math.hypot(v.x, v.y) || 1
  return { x: v.x / len, y: v.y / len }
}

function base(kind: ObstacleKind, pos: Vec2, vel: Vec2, w: number, h: number, warn: number, ctx: ArenaContext): Obstacle {
  return {
    id: nextId++,
    kind,
    pos,
    vel,
    w,
    h,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: 0,
    warn,
    warnAt: {
      x: Math.min(Math.max(pos.x, 0), ctx.width),
      y: Math.min(Math.max(pos.y, 0), ctx.height),
    },
    age: 0,
    ttl: Infinity,
    entered: false,
    grazed: false,
  }
}

export function spawnObstacle(ctx: ArenaContext): Obstacle {
  const { width, height, unit, speedMult, player } = ctx
  const kind = pickKind(ctx.level)
  const edge = Math.floor(Math.random() * 4) as Edge
  const normal = edgeNormal(edge)

  if (kind === 'bar') {
    const vertical = edge === 1 || edge === 3 // enters from a side, so the bar is tall
    const length = unit * rand(30, 52)
    const thick = unit * 2.4
    const w = vertical ? thick : length
    const h = vertical ? length : thick
    const speed = unit * rand(19, 25) * speedMult
    const margin = Math.max(w, h) / 2 + unit
    const pos: Vec2 = vertical
      ? { x: edge === 3 ? -margin : width + margin, y: rand(h / 2, height - h / 2) }
      : { x: rand(w / 2, width - w / 2), y: edge === 0 ? -margin : height + margin }
    const o = base(kind, pos, { x: normal.x * speed, y: normal.y * speed }, w, h, 0.6, ctx)
    o.rot = 0
    return o
  }

  if (kind === 'seeker') {
    const size = unit * 3.1
    const speed = unit * rand(21, 26) * speedMult
    const margin = size
    const pos = edgePoint(edge, width, height, margin)
    const dir = normalize({ x: player.x - pos.x, y: player.y - pos.y })
    const o = base(kind, pos, { x: dir.x * speed, y: dir.y * speed }, size, size, 0.45, ctx)
    o.ttl = 6.5
    o.rotSpeed = 4
    return o
  }

  // block
  const size = unit * rand(3.4, 7.8)
  const speed = unit * rand(26, 40) * speedMult * (size > unit * 6 ? 0.85 : 1)
  const margin = size
  const pos = edgePoint(edge, width, height, margin)
  let dir: Vec2
  if (chance(0.5)) {
    const jitter = unit * 16
    dir = normalize({ x: player.x + rand(-jitter, jitter) - pos.x, y: player.y + rand(-jitter, jitter) - pos.y })
  } else {
    dir = rotate(normal, rand(-0.45, 0.45))
  }
  const o = base(kind, pos, { x: dir.x * speed, y: dir.y * speed }, size, size, 0.55, ctx)
  o.rotSpeed = rand(-2.2, 2.2)
  return o
}

function edgePoint(edge: Edge, width: number, height: number, margin: number): Vec2 {
  switch (edge) {
    case 0:
      return { x: rand(margin, width - margin), y: -margin }
    case 1:
      return { x: width + margin, y: rand(margin, height - margin) }
    case 2:
      return { x: rand(margin, width - margin), y: height + margin }
    default:
      return { x: -margin, y: rand(margin, height - margin) }
  }
}

/** Advance one obstacle by dt seconds. Returns false when it should be removed. */
export function stepObstacle(o: Obstacle, dt: number, ctx: ArenaContext): boolean {
  o.age += dt
  if (o.warn > 0) {
    o.warn -= dt
    return true
  }

  if (o.kind === 'seeker') {
    o.ttl -= dt
    if (o.ttl <= 0) return false
    const speed = Math.hypot(o.vel.x, o.vel.y)
    const desired = normalize({ x: ctx.player.x - o.pos.x, y: ctx.player.y - o.pos.y })
    const turn = Math.min(1, dt * 2.1)
    const nv = normalize({
      x: o.vel.x / speed + (desired.x - o.vel.x / speed) * turn,
      y: o.vel.y / speed + (desired.y - o.vel.y / speed) * turn,
    })
    o.vel.x = nv.x * speed
    o.vel.y = nv.y * speed
  }

  o.pos.x += o.vel.x * dt
  o.pos.y += o.vel.y * dt
  o.rot += o.rotSpeed * dt

  const halfW = o.w / 2
  const halfH = o.h / 2
  const inside =
    o.pos.x + halfW > 0 && o.pos.x - halfW < ctx.width && o.pos.y + halfH > 0 && o.pos.y - halfH < ctx.height
  if (inside) o.entered = true

  // Despawn once it has crossed and fully left, or if something went wrong and it never arrived.
  const margin = Math.max(o.w, o.h) + ctx.unit * 4
  const gone =
    o.pos.x < -margin || o.pos.x > ctx.width + margin || o.pos.y < -margin || o.pos.y > ctx.height + margin
  if (o.entered && gone) return false
  if (!o.entered && o.age > 6) return false
  return true
}

/** Rescale existing obstacles when the arena changes size mid-run (orientation flip, window resize). */
export function rescaleObstacles(list: Obstacle[], sx: number, sy: number, su: number): void {
  for (const o of list) {
    o.pos.x *= sx
    o.pos.y *= sy
    o.warnAt.x *= sx
    o.warnAt.y *= sy
    o.vel.x *= su
    o.vel.y *= su
    o.w *= su
    o.h *= su
  }
}
