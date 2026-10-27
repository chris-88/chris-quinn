import type { Obstacle, Player, Vec2 } from './types'

/** Squared distance between a point and the nearest point of an axis-aligned box. */
function distSqPointToAABB(p: Vec2, cx: number, cy: number, halfW: number, halfH: number): number {
  const dx = Math.max(Math.abs(p.x - cx) - halfW, 0)
  const dy = Math.max(Math.abs(p.y - cy) - halfH, 0)
  return dx * dx + dy * dy
}

/** Effective collision radius for round-ish obstacles (rotating squares, diamonds). */
export function obstacleRadius(o: Obstacle): number {
  return o.w * 0.44
}

/**
 * Signed clearance between the player and an obstacle in CSS px.
 * Negative means overlapping. Bars collide as boxes; everything else as circles.
 */
export function clearance(player: Player, o: Obstacle): number {
  if (o.kind === 'bar') {
    const d = Math.sqrt(distSqPointToAABB(player.pos, o.pos.x, o.pos.y, o.w / 2, o.h / 2))
    return d - player.radius
  }
  const dx = player.pos.x - o.pos.x
  const dy = player.pos.y - o.pos.y
  return Math.sqrt(dx * dx + dy * dy) - (player.radius + obstacleRadius(o))
}

export function intersects(player: Player, o: Obstacle): boolean {
  return clearance(player, o) <= 0
}

/** Keep the player inside the arena, with a small inset so it never clips the border. */
export function clampToArena(player: Player, width: number, height: number): void {
  const half = player.size / 2 + 2
  if (player.pos.x < half) {
    player.pos.x = half
    if (player.vel.x < 0) player.vel.x = 0
  } else if (player.pos.x > width - half) {
    player.pos.x = width - half
    if (player.vel.x > 0) player.vel.x = 0
  }
  if (player.pos.y < half) {
    player.pos.y = half
    if (player.vel.y < 0) player.vel.y = 0
  } else if (player.pos.y > height - half) {
    player.pos.y = height - half
    if (player.vel.y > 0) player.vel.y = 0
  }
}
