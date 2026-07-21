import { useEffect, useState, type ReactNode } from 'react'

// Non-breaking spaces keep short phrases from orphaning on their own line
const PART_A =
  'We are RIF -\u00a0Reduction\u00a0in\u00a0Force; a collective of technical\u00a0creative '
const OUTCASTS = 'outcasts'
const PART_B =
  ' obsessed with creativity\u00a0and\u00a0technology. We\u00a0build '
const PRODUCTS = 'products,\u00a0services'
const PART_C = ', and everything\u00a0in\u00a0between.'
const COPY = (PART_A + OUTCASTS + PART_B + PRODUCTS + PART_C).replace(
  /\u00a0/g,
  ' ',
)

const MESH =
  'linear-gradient(120deg, #0020D9 0%, #FB6604 35%, #F90CC6 65%, #0020D9 100%)'

function jitter(i: number) {
  const a = Math.sin(i * 12.9898) * 43758.5453
  const b = a - Math.floor(a)
  const c = Math.sin(i * 78.233) * 43758.5453
  const d = c - Math.floor(c)
  return {
    x: (b - 0.5) * 10,
    y: (d - 0.5) * 6,
    r: (b - 0.5) * 8,
  }
}

type FocusLink = 'outcasts' | 'products' | null

type Props = {
  onOutcastsEnter: () => void
  onOutcastsLeave: () => void
  onProductsEnter: () => void
  onProductsLeave: () => void
}

function ScribbleChars({
  text,
  startIndex,
  progress,
  mesh = false,
}: {
  text: string
  startIndex: number
  progress: number
  mesh?: boolean
}) {
  const nodes: ReactNode[] = []
  let i = startIndex
  // Split only on regular spaces so \u00a0 widow locks stay inside a word
  const parts = text.split(/([ ]+)/)

  for (let p = 0; p < parts.length; p++) {
    const part = parts[p]
    if (!part) continue

    // Breakable spaces between words (allow wrapping only here)
    if (/^\s+$/.test(part)) {
      const spaceIndex = i
      part.split('').forEach((char, offset) => {
        const idx = spaceIndex + offset
        const visible = progress > idx
        const local = Math.min(1, Math.max(0, progress - idx))
        nodes.push(
          <span
            key={`sp-${idx}`}
            aria-hidden="true"
            style={{
              opacity: visible ? (mesh ? 0.55 + local * 0.45 : 0.15 + local * 0.4) : 0,
            }}
          >
            {char === '\u00a0' ? '\u00a0' : ' '}
          </span>,
        )
      })
      i += part.length
      continue
    }

    // Keep each word intact — no mid-word breaks
    const wordStart = i
    nodes.push(
      <span key={`w-${wordStart}`} className="inline-block whitespace-nowrap">
        {part.split('').map((char, offset) => {
          const idx = wordStart + offset
          const visible = progress > idx
          const local = Math.min(1, Math.max(0, progress - idx))
          const j = jitter(idx)
          const settle = 1 - local
          const opacity = visible
            ? mesh
              ? 0.55 + local * 0.45
              : 0.15 + local * 0.4
            : 0

          return (
            <span
              key={idx}
              aria-hidden="true"
              className={mesh ? 'mesh-link-char' : undefined}
              style={{
                display: 'inline-block',
                opacity,
                transform: visible
                  ? `translate(${j.x * settle}px, ${j.y * settle}px) rotate(${j.r * settle}deg)`
                  : `translate(${j.x}px, ${j.y}px) rotate(${j.r}deg)`,
                ...(mesh
                  ? {
                      backgroundImage: MESH,
                      backgroundSize: '220% 100%',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      WebkitTextFillColor: 'transparent',
                      animationDelay: `${offset * 0.08}s`,
                    }
                  : null),
              }}
            >
              {char}
            </span>
          )
        })}
      </span>,
    )
    i += part.length
  }

  return <>{nodes}</>
}

export default function ScribbleCopy({
  onOutcastsEnter,
  onOutcastsLeave,
  onProductsEnter,
  onProductsLeave,
}: Props) {
  const [progress, setProgress] = useState(0)
  const [focus, setFocus] = useState<FocusLink>(null)

  useEffect(() => {
    const chars = PART_A.length + OUTCASTS.length + PART_B.length + PRODUCTS.length + PART_C.length
    const duration = 4200
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 2.4)
      setProgress(eased * chars)
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const outcastsStart = PART_A.length
  const partBStart = outcastsStart + OUTCASTS.length
  const productsStart = partBStart + PART_B.length
  const partCStart = productsStart + PRODUCTS.length

  const dimmed = focus !== null
  const restStyle = {
    opacity: dimmed ? 0.22 : 1,
    transition: 'opacity 0.35s ease',
  }
  const linkStyle = (key: FocusLink) => ({
    opacity: focus === null || focus === key ? 1 : 0.22,
    transition: 'opacity 0.35s ease',
  })

  return (
    <p
      className="absolute right-6 bottom-6 z-10 m-0 max-w-[min(22rem,calc(100vw-3rem))] text-left text-[0.8125rem] leading-[1.55] sm:right-8 sm:bottom-8 sm:text-[0.875rem]"
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        color: 'rgb(51, 51, 51)',
        fontWeight: 400,
        textWrap: 'pretty',
      }}
      aria-label={COPY}
    >
      <span className="pointer-events-none" style={restStyle}>
        <ScribbleChars text={PART_A} startIndex={0} progress={progress} />
      </span>

      <a
        href="#about"
        className="mesh-link group relative inline-block cursor-pointer whitespace-nowrap no-underline"
        style={linkStyle('outcasts')}
        onMouseEnter={() => {
          setFocus('outcasts')
          onOutcastsEnter()
        }}
        onMouseLeave={() => {
          setFocus(null)
          onOutcastsLeave()
        }}
        onFocus={() => {
          setFocus('outcasts')
          onOutcastsEnter()
        }}
        onBlur={() => {
          setFocus(null)
          onOutcastsLeave()
        }}
      >
        <ScribbleChars
          text={OUTCASTS}
          startIndex={outcastsStart}
          progress={progress}
          mesh
        />
      </a>

      <span className="pointer-events-none" style={restStyle}>
        <ScribbleChars
          text={PART_B}
          startIndex={partBStart}
          progress={progress}
        />
      </span>

      <a
        href="#work"
        className="mesh-link group relative inline-block cursor-pointer whitespace-nowrap no-underline"
        style={linkStyle('products')}
        onMouseEnter={() => {
          setFocus('products')
          onProductsEnter()
        }}
        onMouseLeave={() => {
          setFocus(null)
          onProductsLeave()
        }}
        onFocus={() => {
          setFocus('products')
          onProductsEnter()
        }}
        onBlur={() => {
          setFocus(null)
          onProductsLeave()
        }}
      >
        <ScribbleChars
          text={PRODUCTS}
          startIndex={productsStart}
          progress={progress}
          mesh
        />
      </a>

      <span className="pointer-events-none" style={restStyle}>
        <ScribbleChars
          text={PART_C}
          startIndex={partCStart}
          progress={progress}
        />
      </span>
    </p>
  )
}
