// Generates public/og-image.png (1200x630) and public/apple-touch-icon.png from inline SVG.
// Requires `rsvg-convert` (librsvg). Run with: npm run og:image
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const W = 1200
const H = 630
const SANS = "'Inter', 'Helvetica Neue', Helvetica, Arial, 'DejaVu Sans', sans-serif"
const MONO = "'JetBrains Mono', 'SF Mono', Menlo, Consolas, 'DejaVu Sans Mono', monospace"

const grid = []
for (let x = 30; x < W; x += 30) for (let y = 30; y < H; y += 30) grid.push(`<circle cx="${x}" cy="${y}" r="1.1"/>`)

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="fade" cx="50%" cy="0%" r="90%">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <mask id="gridmask"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#A3E635" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#A3E635" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0B0F14"/>
  <g fill="#2F3946" mask="url(#gridmask)">${grid.join('')}</g>

  <!-- status label -->
  <circle cx="86" cy="118" r="6" fill="#A3E635"/>
  <text x="104" y="123" font-family="${MONO}" font-size="18" letter-spacing="4" fill="#8993A4">SYSTEM ONLINE</text>

  <!-- headline -->
  <text x="80" y="300" font-family="${SANS}" font-size="124" font-weight="600" letter-spacing="-5" fill="#F2F4F7">Hello, internet.</text>

  <!-- subhead -->
  <text x="82" y="366" font-family="${SANS}" font-size="30" fill="#8993A4">A little corner of the internet for building, breaking</text>
  <text x="82" y="408" font-family="${SANS}" font-size="30" fill="#8993A4">and occasionally shipping things. There’s a game, too.</text>

  <!-- path + cursor -->
  <text x="82" y="540" font-family="${MONO}" font-size="22" fill="#5B6473"><tspan fill="#A3E635">➜</tspan>  ~/chrisquinn/playground</text>
  <rect x="412" y="520" width="13" height="26" fill="#A3E635" opacity="0.9"/>

  <!-- the player, mid-run -->
  <g transform="translate(1010 330)">
    <circle r="150" fill="url(#glow)"/>
    <rect x="-70" y="-70" width="140" height="140" rx="26" fill="#A3E635" opacity="0.14"/>
    <rect x="-48" y="-48" width="96" height="96" rx="18" fill="#A3E635" opacity="0.28"/>
    <rect x="-32" y="-32" width="64" height="64" rx="12" fill="#A3E635"/>
    <rect x="-7" y="-7" width="14" height="14" rx="4" fill="#0B0F14" opacity="0.55"/>
  </g>
  <!-- obstacles drifting in -->
  <g fill="#1A222C" stroke="#F2F4F7" stroke-width="2" opacity="0.9">
    <rect x="800" y="120" width="44" height="44" rx="6" transform="rotate(18 822 142)"/>
    <rect x="1090" y="500" width="62" height="62" rx="8" transform="rotate(-12 1121 531)"/>
    <rect x="720" y="470" width="30" height="30" rx="4" transform="rotate(33 735 485)"/>
  </g>
  <g fill="#FB7185" opacity="0.9">
    <polygon points="1125,150 1147,172 1125,194 1103,172"/>
  </g>
  <!-- warning tick on the edge -->
  <rect x="${W - 8}" y="300" width="8" height="90" fill="#A3E635" opacity="0.9"/>

  <!-- footer line -->
  <text x="${W - 80}" y="574" text-anchor="end" font-family="${MONO}" font-size="18" letter-spacing="2" fill="#5B6473">chrisquinn.ie</text>
</svg>`

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#0B0F14"/>
  <rect x="18" y="18" width="28" height="28" rx="5" fill="#A3E635" opacity="0.18"/>
  <rect x="22" y="22" width="20" height="20" rx="3" fill="#A3E635"/>
</svg>`

const dir = mkdtempSync(join(tmpdir(), 'og-'))
const ogPath = join(dir, 'og.svg')
const iconPath = join(dir, 'icon.svg')
writeFileSync(ogPath, og)
writeFileSync(iconPath, icon)

function render(svg, out, w, h) {
  execFileSync('rsvg-convert', ['-w', String(w), '-h', String(h), '-o', out, svg], { stdio: 'inherit' })
  console.log(`wrote ${out}`)
}

render(ogPath, 'public/og-image.png', W, H)
render(iconPath, 'public/apple-touch-icon.png', 180, 180)
