/**
 * Site-wide configuration.
 *
 * Social links are optional: leave a value as `undefined` (or an empty string)
 * and the footer hides that link. Nothing here is invented — fill in only what
 * you actually want to publish.
 */
export const site = {
  name: 'Chris Quinn',
  title: 'Chris Quinn — The Playground',
  description:
    'A little corner of the internet where I build things, break things, test ideas and occasionally ship something useful. There’s a game, too.',
  url: 'https://chrisquinn.ie',
  path: '~/chrisquinn/playground',
  year: 2026,
  links: {
    github: 'https://github.com/chris-88',
    linkedin: undefined as string | undefined,
    email: undefined as string | undefined,
  },
  build: {
    version: __APP_VERSION__,
    sha: __COMMIT_SHA__,
    date: __BUILD_DATE__,
  },
} as const

export type SiteLinks = typeof site.links
