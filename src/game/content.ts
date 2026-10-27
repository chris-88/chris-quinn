import type { Achievement } from './types'

/** Dry, developer-flavoured game-over headlines. One is picked at random per run. */
export const HEADLINES: readonly string[] = [
  'Well, that escalated.',
  "That's a feature, not a bug.",
  'Unhandled collision exception.',
  'Works on my machine.',
  'You were doing so well.',
  'Segmentation fault (core dumped).',
  'Have you tried turning it off and on again?',
  'Expected: dodge. Received: square.',
  'It compiled, though.',
  'Closing the ticket as "won’t fix".',
  'Merge conflict.',
  '404: reflexes not found.',
]

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'still-here', title: 'Still here?', detail: 'Survived 30 seconds. Respect.', at: 30 },
  { id: 'one-more-minute', title: 'One more minute', detail: 'A full 60 seconds without crashing.', at: 60 },
  {
    id: 'unhandled-persistence',
    title: 'Unhandled persistence',
    detail: 'Two minutes. You should probably be working.',
    at: 120,
  },
]
