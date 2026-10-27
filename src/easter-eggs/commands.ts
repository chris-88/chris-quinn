import { site } from '@/config/site'
import { loadBest } from '@/game/storage'
import { toast } from '@/lib/toast'
import { isRetro, setRetro } from './retro'

export interface CommandResult {
  lines: string[]
  /** Side effect the UI should perform. */
  action?: 'clear' | 'play'
}

const HELP = ['help  whoami  pwd  ls  cat <file>  play  theme [retro|default]  clear', 'and whatever else you can think of.']

/** A deliberately tiny shell. Mostly here for one specific sandwich. */
export function runCommand(raw: string): CommandResult {
  const input = raw.trim().replace(/\s+/g, ' ')
  if (!input) return { lines: [] }
  const lower = input.toLowerCase()
  const [cmd = '', ...args] = lower.split(' ')

  if (lower === 'sudo make me a sandwich') {
    window.setTimeout(() => toast('Sandwich delivered.', 'Don’t tell anyone about the sudoers file.', 'info'), 900)
    return { lines: ['Okay.'] }
  }
  if (lower === 'make me a sandwich') return { lines: ['What? Make it yourself.'] }
  if (cmd === 'sudo') return { lines: ['visitor is not in the sudoers file. This incident will be reported.'] }

  switch (cmd) {
    case 'help':
    case '?':
      return { lines: HELP }
    case 'whoami':
      return { lines: ['visitor. probably curious. definitely welcome.'] }
    case 'pwd':
      return { lines: [site.path] }
    case 'ls':
      return { lines: ['build/   break/   ship/   one-more-run/   .secrets'] }
    case 'cat': {
      const file = args[0] ?? ''
      if (file === '.secrets') return { lines: ['↑ ↑ ↓ ↓ ← → ← → B A'] }
      if (file === 'one-more-run' || file === 'one-more-run/') return { lines: ['cat: one-more-run/: Is a directory. Try `play`.'] }
      if (!file) return { lines: ['cat: missing file operand'] }
      return { lines: [`cat: ${file}: No such file or directory`] }
    }
    case 'play':
    case 'start':
    case 'game':
      return { lines: ['Launching one-more-run…'], action: 'play' }
    case 'best':
    case 'score': {
      const best = loadBest()
      return { lines: best > 0 ? [`personal best: ${String(best).padStart(4, '0')} (this browser only)`] : ['no runs yet. try `play`.'] }
    }
    case 'theme': {
      const mode = args[0]
      if (mode === 'retro') {
        setRetro(true)
        return { lines: ['theme: retro'] }
      }
      if (mode === 'default' || mode === 'modern' || mode === 'reset') {
        setRetro(false)
        return { lines: ['theme: default'] }
      }
      return { lines: [`theme: ${isRetro() ? 'retro' : 'default'} (usage: theme retro|default)`] }
    }
    case 'clear':
    case 'cls':
      return { lines: [], action: 'clear' }
    case 'rm':
      return { lines: ['Absolutely not.'] }
    case 'exit':
    case 'quit':
    case 'logout':
      return { lines: ['There is no exit. Only one more run.'] }
    case 'hello':
    case 'hi':
      return { lines: ['Hello, internet.'] }
    case 'vim':
    case 'vi':
    case 'nano':
    case 'emacs':
      return { lines: ['You’re in. Good luck getting out.'] }
    case 'npm':
    case 'pnpm':
    case 'yarn':
      return { lines: ['added 1 package, and audited 1,204 packages in 2s', 'found 0 vulnerabilities (today)'] }
    case 'git':
      return { lines: ['On branch main', 'nothing to commit, working tree clean (suspicious)'] }
    default:
      return { lines: [`command not found: ${cmd}`] }
  }
}
