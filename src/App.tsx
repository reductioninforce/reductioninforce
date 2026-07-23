import { useCallback, useRef, useState } from 'react'
import BouncingPointCloud from './components/BouncingPointCloud'
import ScribbleCopy from './components/ScribbleCopy'
import Logo from './components/Logo'
import AboutReveal from './components/AboutReveal'
import ProjectsReveal from './components/ProjectsReveal'

type Reveal = 'about' | 'projects' | null

const LEAVE_MS = 2000

function App() {
  const [reveal, setReveal] = useState<Reveal>(null)
  const [focus, setFocus] = useState<{
    x: number
    y: number
    radius: number
  } | null>(null)
  const [closing, setClosing] = useState(false)
  const [leaveToken, setLeaveToken] = useState(0)
  const leaveTimer = useRef(0)

  const openReveal = useCallback((next: Reveal) => {
    window.clearTimeout(leaveTimer.current)
    setClosing(false)
    setReveal(next)
  }, [])

  const closeReveal = useCallback(() => {
    window.clearTimeout(leaveTimer.current)
    setLeaveToken((t) => t + 1)
    setClosing(true)
    leaveTimer.current = window.setTimeout(() => {
      setReveal(null)
      setClosing(false)
    }, LEAVE_MS)
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
        closing={closing}
        leaveToken={leaveToken}
        leaveMs={LEAVE_MS}
        onKeepOpen={() => openReveal('about')}
        onClose={closeReveal}
      />
      <ProjectsReveal
        open={reveal === 'projects'}
        focus={focus}
        closing={closing}
        leaveToken={leaveToken}
        leaveMs={LEAVE_MS}
        onKeepOpen={() => openReveal('projects')}
        onClose={closeReveal}
      />
      <Logo
        onGoHome={() => {
          window.clearTimeout(leaveTimer.current)
          setClosing(false)
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
