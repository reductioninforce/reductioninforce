import { useCallback, useRef, useState } from 'react'
import BouncingPointCloud from './components/BouncingPointCloud'
import ScribbleCopy from './components/ScribbleCopy'
import Logo from './components/Logo'
import AboutReveal from './components/AboutReveal'
import ProjectsReveal from './components/ProjectsReveal'

type Reveal = 'about' | 'projects' | null

function App() {
  const [reveal, setReveal] = useState<Reveal>(null)
  const [focus, setFocus] = useState<{
    x: number
    y: number
    radius: number
  } | null>(null)
  const leaveTimer = useRef(0)

  const openReveal = useCallback((next: Reveal) => {
    window.clearTimeout(leaveTimer.current)
    setReveal(next)
  }, [])

  const closeReveal = useCallback(() => {
    window.clearTimeout(leaveTimer.current)
    leaveTimer.current = window.setTimeout(() => setReveal(null), 220)
  }, [])

  const onFocusPoint = useCallback((x: number, y: number, radius: number) => {
    setFocus({ x, y, radius })
  }, [])

  return (
    <>
      <BouncingPointCloud
        exploded={reveal !== null}
        onFocusPoint={onFocusPoint}
      />
      <AboutReveal
        open={reveal === 'about'}
        focus={focus}
        onKeepOpen={() => openReveal('about')}
        onClose={closeReveal}
      />
      <ProjectsReveal
        open={reveal === 'projects'}
        focus={focus}
        onKeepOpen={() => openReveal('projects')}
        onClose={closeReveal}
      />
      <Logo
        onGoHome={() => {
          window.clearTimeout(leaveTimer.current)
          setReveal(null)
        }}
      />

      <main>
        <section
          className="relative z-10 min-h-dvh"
          aria-label="Introduction"
          style={{ pointerEvents: 'none' }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <ScribbleCopy
              onOutcastsEnter={() => openReveal('about')}
              onOutcastsLeave={closeReveal}
              onProductsEnter={() => openReveal('projects')}
              onProductsLeave={closeReveal}
            />
          </div>
        </section>
      </main>
    </>
  )
}

export default App
