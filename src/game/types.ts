export type GamePhase = 'idle' | 'running' | 'paused' | 'dying' | 'over'

export interface Vec2 {
  x: number
  y: number
}

export interface Player {
  pos: Vec2
  vel: Vec2
  /** Visual size (side length) in CSS px. */
  size: number
  /** Collision radius in CSS px — a touch smaller than the visual so hits feel fair. */
  radius: number
  /** Visual tilt derived from velocity. */
  tilt: number
}

export type ObstacleKind = 'block' | 'bar' | 'seeker'

export interface Obstacle {
  id: number
  kind: ObstacleKind
  pos: Vec2
  vel: Vec2
  /** Width / height in CSS px. Blocks and seekers are square. */
  w: number
  h: number
  rot: number
  rotSpeed: number
  /** Seconds left in the edge-warning state before the obstacle enters. */
  warn: number
  /** Where the warning tick is drawn (clamped to the arena edge). */
  warnAt: Vec2
  age: number
  /** Seekers expire after a while so they never chase forever. */
  ttl: number
  /** Set once the obstacle has been inside the arena; enables despawn. */
  entered: boolean
  /** True once this obstacle has triggered a near-miss spark. */
  grazed: boolean
}

export interface Particle {
  pos: Vec2
  vel: Vec2
  life: number
  maxLife: number
  size: number
  color: string
  /** 0 = square, 1 = ring. */
  shape: 0 | 1
  drag: number
}

export interface Palette {
  bg: string
  surface: string
  surface2: string
  fg: string
  muted: string
  faint: string
  line: string
  lineStrong: string
  accent: string
  danger: string
}

export interface Achievement {
  id: string
  title: string
  detail: string
  /** Seconds survived to unlock. */
  at: number
}

export interface GameSnapshot {
  phase: GamePhase
  score: number
  best: number
  /** Difficulty level, starting at 1. */
  level: number
  /** Speed multiplier shown in the HUD, e.g. 1.4. */
  speed: number
  elapsed: number
  isNewBest: boolean
  headline: string
  /** Whether this device appears to be using touch. */
  touch: boolean
}

export interface GameEvents {
  onSnapshot: (snapshot: GameSnapshot) => void
  onAchievement: (achievement: Achievement) => void
}

export interface GameOptions extends GameEvents {
  palette: Palette
  reducedMotion: boolean
}

export interface GameHandle {
  start: () => void
  pause: () => void
  resume: () => void
  togglePause: () => void
  /** Return to the idle state (used by "Back to reality"). */
  exit: () => void
  resize: (width: number, height: number, dpr: number) => void
  setPalette: (palette: Palette) => void
  setReducedMotion: (reduced: boolean) => void
  getSnapshot: () => GameSnapshot
  destroy: () => void
}
