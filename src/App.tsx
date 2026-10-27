import { useCallback, useRef } from 'react'

import { Footer } from '@/components/Footer'
import { GameSection, type GameSectionHandle } from '@/components/GameSection'
import { Hero } from '@/components/Hero'
import { PlaygroundIntro } from '@/components/PlaygroundIntro'
import { Toaster } from '@/components/Toaster'
import { toggleRetro } from '@/easter-eggs/retro'
import { useKonami } from '@/easter-eggs/useKonami'

export default function App() {
  const game = useRef<GameSectionHandle>(null)
  const play = useCallback(() => game.current?.play(), [])
  useKonami(toggleRetro)

  return (
    <>
      <a
        href="#game"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:font-mono focus:text-sm focus:text-bg"
      >
        Skip to the game
      </a>
      <main>
        <Hero />
        <PlaygroundIntro />
        <GameSection ref={game} />
      </main>
      <Footer onPlay={play} />
      <Toaster />
    </>
  )
}
