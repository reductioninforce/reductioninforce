import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  focus: { x: number; y: number; radius: number } | null
  closing: boolean
  leaveToken: number
  leaveMs: number
  onKeepOpen: () => void
  onClose: () => void
}

const PEOPLE = [
  {
    id: 'lao',
    name: 'Lao',
    image: '/lao.png',
    bio: 'Technical creative outcast. Building products, teams, and cultures where beauty and function refuse to compromise.',
  },
  {
    id: 'mal',
    name: 'Mal',
    image: '/mal.png',
    bio: 'Technical creative outcast. Obsessed with craft, systems, and the spaces where culture and product meet.',
  },
] as const

export default function AboutReveal({
  open,
  focus,
  closing,
  leaveToken,
  leaveMs,
  onKeepOpen,
  onClose,
}: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => setVisible(true), 180)
      return () => window.clearTimeout(id)
    }
    setVisible(false)
  }, [open])

  return (
    <aside
      id="about"
      aria-hidden={!open}
      onMouseEnter={onKeepOpen}
      onMouseLeave={onClose}
      className="fixed z-[8] flex max-w-[min(92vw,640px)] gap-4 sm:gap-6"
      style={{
        left: focus ? focus.x : '50%',
        top: focus ? focus.y : '45%',
        opacity: visible ? 1 : 0,
        filter: visible ? 'blur(0px)' : 'blur(16px)',
        transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.92})`,
        transition:
          'opacity 0.7s ease, filter 0.8s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden"
        style={{
          opacity: open && closing ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
      >
        {open && closing ? (
          <div
            key={leaveToken}
            className="overlay-leave-bar h-full w-full origin-left"
            style={{
              background: 'rgba(51, 51, 51, 0.45)',
              animationDuration: `${leaveMs}ms`,
            }}
          />
        ) : null}
      </div>

      {PEOPLE.map((person) => (
        <article key={person.id} className="min-w-0 flex-1 basis-0">
          <div
            className="overflow-hidden"
            style={{ background: 'rgba(240, 238, 230, 0.35)' }}
          >
            <img
              src={person.image}
              alt={person.name}
              className="block h-auto w-full object-cover"
              style={{ aspectRatio: '1 / 1', objectPosition: 'center top' }}
              draggable={false}
            />
          </div>
          <div className="mt-3 text-left sm:mt-4">
            <h2
              className="m-0 text-[1.15rem] tracking-tight sm:text-[1.35rem]"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 500,
                color: 'rgba(51, 51, 51, 0.88)',
              }}
            >
              {person.name}
            </h2>
            <p
              className="mt-1.5 mb-0 text-[0.75rem] leading-relaxed sm:text-[0.8125rem]"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                color: 'rgba(51, 51, 51, 0.58)',
              }}
            >
              {person.bio}
            </p>
          </div>
        </article>
      ))}
    </aside>
  )
}
