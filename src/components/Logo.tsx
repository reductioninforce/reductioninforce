import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'

function jitter(i: number, seed: number) {
  const a = Math.sin((i + seed) * 12.9898) * 43758.5453
  const b = a - Math.floor(a)
  const c = Math.sin((i + seed) * 78.233) * 43758.5453
  const d = c - Math.floor(c)
  return {
    x: (b - 0.5) * 16,
    y: (d - 0.5) * 10,
    r: (b - 0.5) * 14,
  }
}

const LETTERS = [
  {
    d: 'M0 0H32.0509C36.8727 0 41.0091 1.72545 44.46 5.17636C47.9109 8.62727 49.6364 12.7636 49.6364 17.5855C49.6364 20.8945 48.7618 23.9436 47.0127 26.7327C45.3109 29.5218 43.0182 31.6727 40.1345 33.1855L49.6364 49.6364H26.3782V33.1855H23.2582V49.6364H0V0Z',
    ox: 25,
    oy: 25,
  },
  {
    d: 'M77.1325 49.6364H53.8743V0H77.1325V49.6364Z',
    ox: 65.5,
    oy: 25,
  },
  {
    d: 'M83.1658 49.6364V0H132.802V14.5364H106.424V17.5855H132.802V32.0509H106.424V49.6364H83.1658Z',
    ox: 108,
    oy: 25,
  },
] as const

const BLOB_COLORS = ['#0020D9', '#FB6604', '#F90CC6', '#0020D9', '#FB6604'] as const

type Props = {
  onGoHome?: () => void
}

export default function Logo({ onGoHome }: Props) {
  const [progress, setProgress] = useState(3)
  const [hasEntered, setHasEntered] = useState(false)
  const [offsets, setOffsets] = useState(() =>
    LETTERS.map((_, i) => jitter(i + 40, 40)),
  )
  const frameRef = useRef(0)
  const meshRef = useRef(0)
  const blobRefs = useRef<(SVGCircleElement | null)[]>([])
  const groupRefs = useRef<(SVGGElement | null)[]>([])

  const play = useCallback((nextSeed: number, duration: number, isIntro: boolean) => {
    cancelAnimationFrame(frameRef.current)
    if (isIntro) setHasEntered(false)

    const count = LETTERS.length
    const start = performance.now()
    const from = LETTERS.map((_, i) => jitter(i + 40, nextSeed))

    // Snap to jiggled poses immediately, then ease home
    setOffsets(from)
    setProgress(0)

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 2.4)
      const p = eased * count
      setProgress(p)

      setOffsets(
        from.map((j, i) => {
          const local = Math.min(1, Math.max(0, p - i))
          const settle = 1 - local
          return {
            x: j.x * settle,
            y: j.y * settle,
            r: j.r * settle,
          }
        }),
      )

      // Imperative SVG updates — more reliable than React attribute churn
      from.forEach((j, i) => {
        const el = groupRefs.current[i]
        if (!el) return
        const local = Math.min(1, Math.max(0, p - i))
        const settle = 1 - local
        const letter = LETTERS[i]
        el.setAttribute(
          'transform',
          `translate(${j.x * settle} ${j.y * settle}) rotate(${j.r * settle} ${letter.ox} ${letter.oy})`,
        )
        if (isIntro) {
          el.setAttribute('opacity', String(local > 0 ? Math.min(1, 0.2 + local * 0.8) : 0))
        } else {
          el.setAttribute('opacity', '1')
        }
      })

      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        setHasEntered(true)
        setOffsets(LETTERS.map(() => ({ x: 0, y: 0, r: 0 })))
      }
    }

    frameRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    play(40, 1400, true)
    return () => cancelAnimationFrame(frameRef.current)
  }, [play])

  // Auto-jiggle every 10s (hover still triggers too)
  useEffect(() => {
    const id = window.setInterval(() => {
      play(Math.floor(Math.random() * 1000) + 1, 700, false)
    }, 10_000)
    return () => window.clearInterval(id)
  }, [play])

  useEffect(() => {
    let t = 0
    const loop = () => {
      t += 0.0075
      const positions = [
        {
          x: 24 + Math.sin(t * 0.65) * 42 + Math.cos(t * 0.28) * 14,
          y: 18 + Math.cos(t * 0.52) * 20,
          r: 56 + Math.sin(t * 0.38) * 12,
        },
        {
          x: 68 + Math.cos(t * 0.58) * 44 + Math.sin(t * 0.22) * 12,
          y: 30 + Math.sin(t * 0.47) * 22,
          r: 60 + Math.cos(t * 0.33) * 14,
        },
        {
          x: 108 + Math.sin(t * 0.5 + 1.4) * 38,
          y: 16 + Math.cos(t * 0.63 + 0.5) * 22,
          r: 58 + Math.sin(t * 0.42 + 0.9) * 13,
        },
        {
          x: 52 + Math.cos(t * 0.36 + 2.1) * 48,
          y: 42 + Math.sin(t * 0.55 + 1.2) * 14,
          r: 50 + Math.cos(t * 0.48) * 10,
        },
        {
          x: 90 + Math.sin(t * 0.44 + 0.7) * 40,
          y: 36 + Math.cos(t * 0.39 + 1.8) * 16,
          r: 48 + Math.sin(t * 0.51 + 0.3) * 11,
        },
      ]

      positions.forEach((p, i) => {
        const el = blobRefs.current[i]
        if (!el) return
        el.setAttribute('cx', String(p.x))
        el.setAttribute('cy', String(p.y))
        el.setAttribute('r', String(p.r))
      })

      meshRef.current = requestAnimationFrame(loop)
    }
    meshRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(meshRef.current)
  }, [])

  const handleEnter = () => {
    play(Math.floor(Math.random() * 1000) + 1, 700, false)
  }

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    onGoHome?.()
    window.scrollTo(0, 0)
    window.location.assign('/')
  }

  return (
    <a
      href="/"
      aria-label="RIF — Reduction in Force — Home"
      className="rif-logo fixed top-6 left-6 z-50 sm:top-8 sm:left-8"
      style={{ pointerEvents: 'auto' }}
      onMouseEnter={handleEnter}
      onFocus={handleEnter}
      onClick={handleClick}
    >
      <svg
        width="133"
        height="50"
        viewBox="0 0 133 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-auto sm:h-8"
        overflow="visible"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <filter
            id="rifMeshBlur"
            x="-50%"
            y="-80%"
            width="200%"
            height="260%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="10" />
          </filter>

          <pattern
            id="rifMeshFill"
            patternUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="133"
            height="50"
          >
            <rect width="133" height="50" fill="#F90CC6" />
            <g filter="url(#rifMeshBlur)">
              {BLOB_COLORS.map((color, i) => (
                <circle
                  key={i}
                  ref={(el) => {
                    blobRefs.current[i] = el
                  }}
                  cx={40 + i * 18}
                  cy={25}
                  r={55}
                  fill={color}
                />
              ))}
            </g>
          </pattern>
        </defs>

        {LETTERS.map((letter, i) => {
          const o = offsets[i] ?? { x: 0, y: 0, r: 0 }
          const opacity = hasEntered
            ? 1
            : progress > i
              ? Math.min(1, 0.2 + (progress - i) * 0.8)
              : 0

          return (
            <g
              key={i}
              ref={(el) => {
                groupRefs.current[i] = el
              }}
              opacity={opacity}
              transform={`translate(${o.x} ${o.y}) rotate(${o.r} ${letter.ox} ${letter.oy})`}
            >
              <path d={letter.d} fill="#333333" />
              <path
                className="logo-mesh"
                d={letter.d}
                fill="url(#rifMeshFill)"
              />
            </g>
          )
        })}
      </svg>
    </a>
  )
}
