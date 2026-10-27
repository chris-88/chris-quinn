# chrisquinn.ie — The Playground

My little corner of the internet. One page, one idea, one ridiculously replayable little game.

Live at **https://chrisquinn.ie** (deployed from `main` via GitHub Pages).

## What's here

- **Hero** — "Hello, internet." A short, personal introduction.
- **A playground, not a portfolio** — three small cards: Build / Break / Ship.
- **One More Run** — a purpose-built HTML Canvas arcade game. Dodge everything, survive as long as you can, it gets faster. Personal best is stored in `localStorage` (this browser only; there is no leaderboard).
- **A few Easter eggs** — the Konami code, a friendly console message, a tiny shell in the footer (try `help`, or a certain sandwich), and achievements for surviving long enough.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · a shadcn-style `Button` · Lucide icons · GitHub Pages via GitHub Actions.

No backend, no analytics, no cookies, no tracking. The game engine has zero dependencies.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run typecheck  # tsc -b
npm run lint       # oxlint
npm run build      # typecheck + production build to dist/
npm run preview    # serve dist/ locally
npm run og:image   # regenerate public/og-image.png + apple-touch-icon.png (needs rsvg-convert)
```

## Project structure

```
.github/workflows/deploy.yml   Build + deploy to GitHub Pages on push to main
public/                        CNAME, favicon.svg, og-image.png, robots.txt, sitemap.xml
scripts/og-image.mjs           Generates the social preview image from inline SVG
src/
  components/                  Hero, PlaygroundIntro, GameSection, Footer, CommandLine, Toaster
  components/ui/button.tsx     shadcn-style button (cva + tailwind-merge)
  game/                        The engine — no React in here
    engine.ts                  Game loop, phases, difficulty, scoring, achievements
    player.ts                  Movement (keyboard accel/friction, touch follow)
    obstacles.ts               Spawning and motion for blocks, bars and seekers
    collisions.ts              Circle/AABB tests and arena clamping
    particles.ts               Trail, sparks, bursts, rings
    render.ts                  Canvas renderer (DPR-aware, cached grid, no shadowBlur)
    input.ts                   Keyboard + pointer input
    storage.ts                 Safe localStorage wrapper with in-memory fallback
    content.ts                 Game-over headlines and achievements
  hooks/useGame.ts             Mounts the engine, handles resize/visibility/theme
  easter-eggs/                 Konami code, retro theme, console greeting, footer shell
  config/site.ts               Title, description, URL, social links, build info
```

### Configuration

Edit [`src/config/site.ts`](src/config/site.ts). Social links that are `undefined` are hidden in the footer — nothing is invented.

### Game controls

| Platform | Move                | Start / restart | Pause |
| -------- | ------------------- | --------------- | ----- |
| Desktop  | Arrow keys or WASD  | Space / Enter   | Esc   |
| Touch    | Drag anywhere       | Tap the button  | —     |

The game pauses automatically when the tab is hidden or the window loses focus, respects `prefers-reduced-motion` (no screen shake, fewer particles), and the page remains fully usable if the canvas cannot start.

## Deployment

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): install → lint → build → upload `dist/` → deploy with `actions/deploy-pages`.

### One-time GitHub Pages setup

1. Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Under **Custom domain**, enter `chrisquinn.ie` and save. `public/CNAME` keeps this in sync on every deploy.
3. Once DNS has propagated (below), tick **Enforce HTTPS**. GitHub provisions the certificate automatically; it can take up to an hour after DNS resolves.

### DNS for an apex domain

`chrisquinn.ie` is an apex domain, so it **cannot use a CNAME** (that would break the zone's MX/NS records). Point it at GitHub Pages with A/AAAA records and give `www` a CNAME.

At your DNS provider (the zone is served by `ns9/ns10.dnsireland.com`):

| Type  | Name  | Value                     |
| ----- | ----- | ------------------------- |
| A     | `@`   | `185.199.108.153`         |
| A     | `@`   | `185.199.109.153`         |
| A     | `@`   | `185.199.110.153`         |
| A     | `@`   | `185.199.111.153`         |
| AAAA  | `@`   | `2606:50c0:8000::153`     |
| AAAA  | `@`   | `2606:50c0:8001::153`     |
| AAAA  | `@`   | `2606:50c0:8002::153`     |
| AAAA  | `@`   | `2606:50c0:8003::153`     |
| CNAME | `www` | `chris-88.github.io.`     |

Remove the existing `A @ 185.43.234.250` (registrar parking) record. The `www` record currently points at the apex; change it to the CNAME above so GitHub can also serve and redirect `www.chrisquinn.ie`.

**Do not touch `invite.chrisquinn.ie`.** It is a separate CNAME to `chris-88.github.io` served by the `chris-88/invite` repository and is unaffected by this project. GitHub routes each hostname to the repository whose Pages custom domain matches, so both sites coexist on the same account.

Verify with:

```bash
dig +short A chrisquinn.ie       # four 185.199.10x.153 addresses
dig +short CNAME www.chrisquinn.ie
curl -sI https://chrisquinn.ie | head -1
```

## Licence

Code: MIT. Words and the game design: mine, but you're welcome to be inspired.
