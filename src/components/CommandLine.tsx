import { useId, useState } from 'react'

import { runCommand } from '@/easter-eggs/commands'

interface Props {
  onPlay: () => void
}

export function CommandLine({ onPlay }: Props) {
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const id = useId()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = runCommand(value)
    if (result.action === 'clear') {
      setHistory([])
    } else if (value.trim()) {
      setHistory((h) => [...h, `$ ${value.trim()}`, ...result.lines].slice(-8))
    }
    if (result.action === 'play') onPlay()
    setValue('')
  }

  return (
    <div className="font-mono text-xs">
      {history.length > 0 && (
        <ol aria-live="polite" className="mb-2 space-y-0.5 text-muted">
          {history.map((line, i) => (
            <li key={`${i}-${line}`} className={line.startsWith('$ ') ? 'text-faint' : 'text-fg/90'}>
              {line}
            </li>
          ))}
        </ol>
      )}
      <form onSubmit={submit} className="flex items-center gap-2">
        <label htmlFor={id} className="shrink-0 text-accent/80">
          <span className="sr-only">Run a command</span>
          <span aria-hidden="true">$</span>
        </label>
        <input
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="type `help`"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          className="w-full min-w-0 bg-transparent text-fg placeholder:text-faint/80 focus:outline-none"
        />
      </form>
    </div>
  )
}
