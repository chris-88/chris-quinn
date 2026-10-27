import { obstacleRadius } from './collisions'
import type { GamePhase, Obstacle, Palette, Particle, Player, Vec2 } from './types'

export interface RenderState {
  width: number
  height: number
  unit: number
  phase: GamePhase
  /** Wall-clock seconds since the engine was created; drives idle animation. */
  clock: number
  player: Player
  obstacles: readonly Obstacle[]
  particles: readonly Particle[]
  /** 0..1 screen shake intensity. */
  shake: number
  /** 0..1 white flash on death. */
  flash: number
  dragging: boolean
  reducedMotion: boolean
}

export class Renderer {
  private grid: HTMLCanvasElement | null = null
  private vignette: CanvasGradient | null = null
  private gridKey = ''

  private readonly ctx: CanvasRenderingContext2D
  private palette: Palette

  constructor(ctx: CanvasRenderingContext2D, palette: Palette) {
    this.ctx = ctx
    this.palette = palette
  }

  setPalette(p: Palette): void {
    this.palette = p
    this.grid = null
  }

  invalidate(): void {
    this.grid = null
    this.vignette = null
  }

  draw(s: RenderState): void {
    const { ctx } = this
    const { width, height, unit } = s
    const p = this.palette

    ctx.save()
    ctx.fillStyle = p.bg
    ctx.fillRect(0, 0, width, height)
    this.drawGrid(s)

    if (s.shake > 0 && !s.reducedMotion) {
      const amp = unit * 1.4 * s.shake
      ctx.translate((Math.random() * 2 - 1) * amp, (Math.random() * 2 - 1) * amp)
    }

    if (s.phase === 'idle') {
      this.drawIdle(s)
    } else {
      for (const o of s.obstacles) if (o.warn > 0) this.drawWarning(o, s)
      this.drawParticles(s.particles)
      for (const o of s.obstacles) if (o.warn <= 0) this.drawObstacle(o, s)
      if (s.phase !== 'over') this.drawPlayer(s.player, s)
    }

    ctx.restore()

    if (s.flash > 0) {
      ctx.fillStyle = `rgba(242,244,247,${(0.55 * s.flash).toFixed(3)})`
      ctx.fillRect(0, 0, width, height)
    }

    this.drawVignette(s)
  }

  private drawGrid(s: RenderState): void {
    const key = `${s.width}x${s.height}`
    if (!this.grid || this.gridKey !== key) {
      this.gridKey = key
      const dpr = this.ctx.getTransform().a || 1
      const c = document.createElement('canvas')
      c.width = Math.max(1, Math.round(s.width * dpr))
      c.height = Math.max(1, Math.round(s.height * dpr))
      const g = c.getContext('2d')
      if (g) {
        g.scale(dpr, dpr)
        g.fillStyle = this.palette.lineStrong
        const step = 26
        const ox = (s.width % step) / 2
        const oy = (s.height % step) / 2
        for (let x = ox; x <= s.width; x += step) {
          for (let y = oy; y <= s.height; y += step) {
            g.fillRect(x - 0.6, y - 0.6, 1.2, 1.2)
          }
        }
      }
      this.grid = c
    }
    this.ctx.globalAlpha = 0.7
    this.ctx.drawImage(this.grid, 0, 0, s.width, s.height)
    this.ctx.globalAlpha = 1
  }

  private drawVignette(s: RenderState): void {
    const { ctx } = this
    if (!this.vignette) {
      const r = Math.hypot(s.width, s.height) / 2
      const g = ctx.createRadialGradient(s.width / 2, s.height / 2, r * 0.45, s.width / 2, s.height / 2, r)
      g.addColorStop(0, 'rgba(11,15,20,0)')
      g.addColorStop(1, 'rgba(11,15,20,0.55)')
      this.vignette = g
    }
    ctx.fillStyle = this.vignette
    ctx.fillRect(0, 0, s.width, s.height)
  }

  private drawIdle(s: RenderState): void {
    // A gently breathing square in the middle: "I'm here, press start."
    const { ctx } = this
    const t = s.clock
    const breathe = s.reducedMotion ? 1 : 1 + Math.sin(t * 1.6) * 0.06
    const size = s.player.size * breathe
    const x = s.width / 2
    const y = s.height / 2
    this.glow(x, y, size, 0.16)
    ctx.fillStyle = this.palette.accent
    ctx.globalAlpha = 0.85
    this.roundRect(x - size / 2, y - size / 2, size, size, size * 0.18)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  private drawWarning(o: Obstacle, s: RenderState): void {
    const { ctx } = this
    const u = s.unit
    const t = 1 - Math.min(1, Math.max(0, o.warn / 0.6))
    const alpha = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * Math.PI * 6))
    ctx.fillStyle = this.palette.accent
    ctx.globalAlpha = alpha
    const len = o.kind === 'bar' ? Math.max(o.w, o.h) : u * 4 + o.w * 0.5
    const thick = u * 0.7
    const atLeft = o.warnAt.x <= 0.5
    const atRight = o.warnAt.x >= s.width - 0.5
    const atTop = o.warnAt.y <= 0.5
    const atBottom = o.warnAt.y >= s.height - 0.5
    if (atLeft || atRight) {
      const x = atLeft ? 0 : s.width - thick
      ctx.fillRect(x, o.warnAt.y - len / 2, thick, len)
    } else if (atTop || atBottom) {
      const y = atTop ? 0 : s.height - thick
      ctx.fillRect(o.warnAt.x - len / 2, y, len, thick)
    }
    ctx.globalAlpha = 1
  }

  private drawObstacle(o: Obstacle, s: RenderState): void {
    const { ctx } = this
    const p = this.palette
    ctx.save()
    ctx.translate(o.pos.x, o.pos.y)

    if (o.kind === 'bar') {
      ctx.fillStyle = p.surface2
      ctx.strokeStyle = p.muted
      ctx.lineWidth = 1.25
      this.roundRect(-o.w / 2, -o.h / 2, o.w, o.h, Math.min(o.w, o.h) * 0.3)
      ctx.fill()
      ctx.stroke()
      // Hazard ticks along the bar so it reads as "wall", not decoration.
      ctx.fillStyle = p.faint
      const horizontal = o.w > o.h
      const length = horizontal ? o.w : o.h
      const step = s.unit * 3
      for (let d = -length / 2 + step; d < length / 2 - step * 0.5; d += step) {
        if (horizontal) ctx.fillRect(d - 0.75, -o.h * 0.2, 1.5, o.h * 0.4)
        else ctx.fillRect(-o.w * 0.2, d - 0.75, o.w * 0.4, 1.5)
      }
    } else if (o.kind === 'seeker') {
      ctx.rotate(o.rot)
      const r = obstacleRadius(o) * 1.15
      const fade = Math.min(1, o.ttl / 0.6)
      ctx.globalAlpha = fade
      ctx.fillStyle = p.danger
      ctx.beginPath()
      ctx.moveTo(0, -r)
      ctx.lineTo(r, 0)
      ctx.lineTo(0, r)
      ctx.lineTo(-r, 0)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = p.bg
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    } else {
      ctx.rotate(o.rot)
      ctx.fillStyle = p.surface2
      ctx.strokeStyle = p.fg
      ctx.lineWidth = 1.25
      ctx.globalAlpha = 0.92
      this.roundRect(-o.w / 2, -o.h / 2, o.w, o.h, o.w * 0.14)
      ctx.fill()
      ctx.stroke()
      ctx.globalAlpha = 1
    }
    ctx.restore()
  }

  private drawPlayer(pl: Player, s: RenderState): void {
    const { ctx } = this
    const size = pl.size
    this.glow(pl.pos.x, pl.pos.y, size, s.dragging ? 0.22 : 0.16)
    ctx.save()
    ctx.translate(pl.pos.x, pl.pos.y)
    ctx.rotate(pl.tilt)
    ctx.fillStyle = this.palette.accent
    this.roundRect(-size / 2, -size / 2, size, size, size * 0.18)
    ctx.fill()
    // Tiny inner mark so rotation and direction read clearly.
    ctx.fillStyle = this.palette.bg
    ctx.globalAlpha = 0.55
    const m = size * 0.22
    this.roundRect(-m / 2, -m / 2, m, m, m * 0.3)
    ctx.fill()
    ctx.restore()
  }

  private drawParticles(list: readonly Particle[]): void {
    const { ctx } = this
    for (const p of list) {
      const t = Math.max(0, p.life / p.maxLife)
      if (p.shape === 1) {
        const r = p.size * (1 + (1 - t) * 12)
        ctx.strokeStyle = p.color
        ctx.globalAlpha = t * 0.7
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(p.pos.x, p.pos.y, r, 0, Math.PI * 2)
        ctx.stroke()
      } else {
        ctx.fillStyle = p.color
        ctx.globalAlpha = t * 0.9
        const sz = p.size * (0.4 + 0.6 * t)
        ctx.fillRect(p.pos.x - sz / 2, p.pos.y - sz / 2, sz, sz)
      }
    }
    ctx.globalAlpha = 1
  }

  /** Cheap glow: a larger translucent square behind the shape (no shadowBlur). */
  private glow(x: number, y: number, size: number, alpha: number): void {
    const { ctx } = this
    ctx.fillStyle = this.palette.accent
    ctx.globalAlpha = alpha
    const g1 = size * 1.9
    this.roundRect(x - g1 / 2, y - g1 / 2, g1, g1, g1 * 0.3)
    ctx.fill()
    ctx.globalAlpha = alpha * 0.6
    const g2 = size * 1.35
    this.roundRect(x - g2 / 2, y - g2 / 2, g2, g2, g2 * 0.25)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    const { ctx } = this
    const rr = Math.min(r, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + rr, y)
    ctx.lineTo(x + w - rr, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr)
    ctx.lineTo(x + w, y + h - rr)
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
    ctx.lineTo(x + rr, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr)
    ctx.lineTo(x, y + rr)
    ctx.quadraticCurveTo(x, y, x + rr, y)
    ctx.closePath()
  }
}

export function midpoint(a: Vec2, b: Vec2): Vec2 {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}
