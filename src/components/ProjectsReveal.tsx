import { useEffect, useState } from 'react'
import { projects } from '../data/projects'

type Props = {
  open: boolean
  focus: { x: number; y: number; radius: number } | null
  onKeepOpen: () => void
  onClose: () => void
}

export default function ProjectsReveal({
  open,
  focus,
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
      id="work"
      aria-hidden={!open}
      onMouseEnter={onKeepOpen}
      onMouseLeave={onClose}
      className="fixed z-[8] flex max-w-[min(94vw,720px)] flex-wrap justify-center gap-3 sm:gap-4"
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
      {projects.map((project) => (
        <a
          key={project.id}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group min-w-0 basis-[calc(50%-0.4rem)] no-underline sm:basis-[calc(25%-0.75rem)]"
          style={{ color: 'inherit' }}
        >
          <div
            className="overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 30% 25%, ${project.tone}bb 0%, transparent 60%),
                radial-gradient(ellipse 70% 50% at 75% 70%, ${project.accent}99 0%, transparent 55%),
                #F0EEE6
              `,
              aspectRatio: '1 / 1',
              boxShadow: `inset 0 0 0 1.5px ${project.ink}55`,
            }}
          />
          <div className="mt-2.5 text-left sm:mt-3">
            <h2
              className="m-0 text-[1rem] tracking-tight sm:text-[1.15rem]"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 500,
                color: 'rgba(51, 51, 51, 0.88)',
              }}
            >
              {project.title}
            </h2>
            <p
              className="mt-1 mb-0 text-[0.7rem] leading-relaxed sm:text-[0.75rem]"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                color: 'rgba(51, 51, 51, 0.55)',
              }}
            >
              {project.subtitle}
            </p>
          </div>
        </a>
      ))}
    </aside>
  )
}
