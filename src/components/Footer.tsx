import { Mail, type LucideIcon } from 'lucide-react'

import { GitHubIcon, LinkedInIcon, type BrandIcon } from '@/components/BrandIcons'
import { CommandLine } from '@/components/CommandLine'
import { site } from '@/config/site'

interface Props {
  onPlay: () => void
}

interface LinkDef {
  label: string
  href: string | undefined
  Icon: BrandIcon | LucideIcon
}

export function Footer({ onPlay }: Props) {
  const links: LinkDef[] = [
    { label: 'GitHub', href: site.links.github, Icon: GitHubIcon },
    { label: 'LinkedIn', href: site.links.linkedin, Icon: LinkedInIcon },
    { label: 'Email', href: site.links.email ? `mailto:${site.links.email}` : undefined, Icon: Mail },
  ].filter((l) => Boolean(l.href))

  return (
    <footer className="px-5 pt-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-lg border border-line bg-surface/40 px-4 py-3">
          <CommandLine onPlay={onPlay} />
        </div>

        <div className="mt-8 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-fg">
              © {site.year} {site.name}
            </p>
            <p className="text-sm text-muted">Built because I could.</p>
          </div>

          <div className="flex flex-col gap-4 sm:items-end">
            {links.length > 0 && (
              <ul className="flex items-center gap-1">
                {links.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={href?.startsWith('mailto:') ? undefined : '_blank'}
                      rel={href?.startsWith('mailto:') ? undefined : 'noopener noreferrer me'}
                      aria-label={label}
                      title={label}
                      className="inline-flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-fg"
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="flex items-center gap-2 font-mono text-[0.68rem] tracking-wider text-faint">
              <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-accent/80" />
              <span>
                static · no tracking · v{site.build.version} · {site.build.sha}
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
