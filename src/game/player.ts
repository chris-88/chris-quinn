import type { Player, Vec2 } from './types'

/** Movement tuning in arena units (u = min(width, height) / 100). */
const MAX_SPEED_U = 62
const ACCEL_U = 520
const FRICTION = 14
const DRAG_GAIN = 1.25
const DRAG_FOLLOW = 28

export function createPlayer(width: number, height: number, unit: number): Player {
  const size = unit * 3.6
  return {
    pos: { x: width / 2, y: height / 2 },
    vel: { x: 0, y: 0 },
    size,
    radius: size * 0.42,
    tilt: 0,
  }
}

export function resizePlayer(player: Player, unit: number): void {
  player.size = unit * 3.6
  player.radius = player.size * 0.42
}

/**
 * Integrates player motion for one sub-step.
 * Keyboard gives acceleration with friction; pointer drag moves a target the
 * player follows, so a finger never has to cover the square itself.
 */
export function stepPlayer(
  player: Player,
  dt: number,
  unit: number,
  axis: Vec2,
  drag: Vec2,
  dragTarget: Vec2 | null,
): void {
  const maxSpeed = MAX_SPEED_U * unit
  const accel = ACCEL_U * unit

  if (dragTarget) {
    dragTarget.x += drag.x * DRAG_GAIN
    dragTarget.y += drag.y * DRAG_GAIN
    // Critically-damped-ish follow: velocity derived from target offset.
    const k = 1 - Math.exp(-DRAG_FOLLOW * dt)
    const nx = player.pos.x + (dragTarget.x - player.pos.x) * k
    const ny = player.pos.y + (dragTarget.y - player.pos.y) * k
    player.vel.x = (nx - player.pos.x) / Math.max(dt, 1e-4)
    player.vel.y = (ny - player.pos.y) / Math.max(dt, 1e-4)
    player.pos.x = nx
    player.pos.y = ny
  } else {
    const len = Math.hypot(axis.x, axis.y)
    if (len > 0) {
      const ax = (axis.x / len) * accel
      const ay = (axis.y / len) * accel
      player.vel.x += ax * dt
      player.vel.y += ay * dt
    }
    // Exponential friction, frame-rate independent.
    const f = Math.exp(-FRICTION * dt)
    player.vel.x *= f
    player.vel.y *= f

    const speed = Math.hypot(player.vel.x, player.vel.y)
    if (speed > maxSpeed) {
      player.vel.x = (player.vel.x / speed) * maxSpeed
      player.vel.y = (player.vel.y / speed) * maxSpeed
    }
    player.pos.x += player.vel.x * dt
    player.pos.y += player.vel.y * dt
  }

  // Lean slightly into horizontal motion. Purely cosmetic.
  const targetTilt = Math.max(-0.22, Math.min(0.22, (player.vel.x / maxSpeed) * 0.22))
  player.tilt += (targetTilt - player.tilt) * Math.min(1, dt * 18)
}
