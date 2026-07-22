import { useEffect, useRef } from 'react'

type Point = {
  x: number
  y: number
  z: number
  size: number
  field: number
  active: boolean
  targetX: number
  targetY: number
  originalX: number
  originalY: number
  phase: number
  vx: number
  vy: number
}

type Props = {
  exploded?: boolean
  onFocusPoint?: (x: number, y: number, radius: number) => void
}

/**
 * Themes: following intuition, no fixed path, open mind leads forward
 * Visualization: Points freely follow an unpredictable leader
 */
export default function BouncingPointCloud({
  exploded = false,
  onFocusPoint,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const explodedRef = useRef(exploded)
  const burstRef = useRef(false)
  const onFocusPointRef = useRef(onFocusPoint)
  const blurRef = useRef(0)

  useEffect(() => {
    explodedRef.current = exploded
    if (!exploded) burstRef.current = false
  }, [exploded])

  useEffect(() => {
    onFocusPointRef.current = onFocusPoint
  }, [onFocusPoint])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let time = 0
    let lastFrameTime = 0
    let animationFrameId = 0
    const targetFPS = 18
    const frameInterval = 1000 / targetFPS
    const numPoints = 25000
    const points: Point[] = []

    const ball = {
      x: 0,
      y: 0,
      radius: 120,
      vx: (Math.random() * 2 - 1) * 2,
      vy: (Math.random() * 2 - 1) * 2,
    }

    const mouse = { x: 0, y: 0, hasMoved: false }
    // Slow drift toward cursor (fraction of remaining distance per frame @ ~18fps)
    const mouseFollow = 0.005

    const onPointerMove = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.hasMoved = true
    }

    const calculateField = (x: number, y: number) => {
      const dx = x - ball.x
      const dy = y - ball.y
      const distSq = dx * dx + dy * dy
      return (ball.radius * ball.radius) / Math.max(distSq, 0.0001)
    }

    const seedPoints = () => {
      points.length = 0
      for (let i = 0; i < numPoints; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const field = calculateField(x, y)

        points.push({
          x,
          y,
          z: Math.random() * 2 - 1,
          size: 0.5 + Math.random() * 1.5,
          field,
          active: field > 1,
          targetX: x,
          targetY: y,
          originalX: x,
          originalY: y,
          phase: Math.random() * Math.PI * 2,
          vx: 0,
          vy: 0,
        })
      }
    }

    const triggerBurst = () => {
      for (const point of points) {
        const dx = point.x - ball.x
        const dy = point.y - ball.y
        const dist = Math.hypot(dx, dy) || 1
        const near = dist < ball.radius * 2.2
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.8
        const speed = near
          ? 4 + Math.random() * 10
          : 0.5 + Math.random() * 2.5
        point.vx = Math.cos(angle) * speed
        point.vy = Math.sin(angle) * speed
        point.active = false
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight

      ball.radius = Math.min(width, height) * 0.18
      if (!explodedRef.current) {
        ball.x = width / 2
        ball.y = height / 2
      }

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      seedPoints()
      burstRef.current = false
      ctx.fillStyle = '#F0EEE6'
      ctx.fillRect(0, 0, width, height)
    }

    const animate = (currentTime: number) => {
      if (!lastFrameTime) lastFrameTime = currentTime
      const deltaTime = currentTime - lastFrameTime

      if (deltaTime >= frameInterval) {
        const exploding = explodedRef.current

        if (exploding && !burstRef.current) {
          triggerBurst()
          burstRef.current = true
          onFocusPointRef.current?.(ball.x, ball.y, ball.radius)
        }

        // Ease canvas blur toward explode / recover
        const blurTarget = exploding ? 18 : 0
        blurRef.current += (blurTarget - blurRef.current) * 0.08
        canvas.style.filter = `blur(${blurRef.current}px)`
        canvas.style.opacity = exploding
          ? String(Math.max(0.15, 1 - blurRef.current / 22))
          : '1'

        ctx.fillStyle = '#F0EEE6'
        ctx.fillRect(0, 0, width, height)

        time += 0.0005

        if (!exploding) {
          ball.x += ball.vx
          ball.y += ball.vy

          if (mouse.hasMoved) {
            ball.x += (mouse.x - ball.x) * mouseFollow
            ball.y += (mouse.y - ball.y) * mouseFollow
          }

          if (ball.x - ball.radius < 0) {
            ball.x = ball.radius
            ball.vx = Math.abs(ball.vx) * (0.9 + Math.random() * 0.2)
            ball.vy += (Math.random() * 2 - 1) * 0.5
          }
          if (ball.x + ball.radius > width) {
            ball.x = width - ball.radius
            ball.vx = -Math.abs(ball.vx) * (0.9 + Math.random() * 0.2)
            ball.vy += (Math.random() * 2 - 1) * 0.5
          }
          if (ball.y - ball.radius < 0) {
            ball.y = ball.radius
            ball.vy = Math.abs(ball.vy) * (0.9 + Math.random() * 0.2)
            ball.vx += (Math.random() * 2 - 1) * 0.5
          }
          if (ball.y + ball.radius > height) {
            ball.y = height - ball.radius
            ball.vy = -Math.abs(ball.vy) * (0.9 + Math.random() * 0.2)
            ball.vx += (Math.random() * 2 - 1) * 0.5
          }

          const minSpeed = 0.75
          const currentSpeed = Math.hypot(ball.vx, ball.vy)
          if (currentSpeed < minSpeed && currentSpeed > 0) {
            ball.vx = (ball.vx / currentSpeed) * minSpeed
            ball.vy = (ball.vy / currentSpeed) * minSpeed
          }

          const maxSpeed = 1.5
          const speedFactor =
            currentSpeed > 0 ? Math.min(1, maxSpeed / currentSpeed) : 1
          ball.vx *= speedFactor
          ball.vy *= speedFactor
        }

        for (const point of points) {
          if (exploding || burstRef.current) {
            point.x += point.vx
            point.y += point.vy
            point.vx *= 0.985
            point.vy *= 0.985
            // Drift outward a bit more
            point.x += (point.x - ball.x) * 0.002
            point.y += (point.y - ball.y) * 0.002

            const fade = exploding ? 0.35 : 0.7
            ctx.fillStyle = `rgba(51, 51, 51, ${fade * (0.15 + Math.random() * 0.1)})`
            ctx.beginPath()
            ctx.arc(point.x, point.y, point.size * (exploding ? 1.4 : 1), 0, Math.PI * 2)
            ctx.fill()
            continue
          }

          // Recovering from burst — gently return to field behavior
          if (point.vx !== 0 || point.vy !== 0) {
            point.vx *= 0.9
            point.vy *= 0.9
            point.x += point.vx
            point.y += point.vy
            if (Math.abs(point.vx) < 0.05 && Math.abs(point.vy) < 0.05) {
              point.vx = 0
              point.vy = 0
            }
          }

          const field = calculateField(point.x, point.y)
          const prevActive = point.active
          point.active = field > 1
          point.field = field

          if (point.active !== prevActive) {
            if (point.active) {
              const angle = Math.random() * Math.PI * 2
              const dist = 5 + Math.random() * 10
              point.targetX = point.x + Math.cos(angle) * dist
              point.targetY = point.y + Math.sin(angle) * dist
            } else {
              point.targetX = point.originalX
              point.targetY = point.originalY
            }
          }

          if (point.active) {
            const angle = Math.atan2(point.y - ball.y, point.x - ball.x)
            const distFromCenter = Math.hypot(point.x - ball.x, point.y - ball.y)
            const tangentialAngle = angle + Math.PI / 2
            const flowSpeed = 0.25 * (1 - distFromCenter / ball.radius)

            point.x += Math.cos(tangentialAngle) * flowSpeed
            point.y += Math.sin(tangentialAngle) * flowSpeed

            const radialPulse = Math.sin(time * 2 + point.phase) * 0.2
            point.x += Math.cos(angle) * radialPulse
            point.y += Math.sin(angle) * radialPulse

            if (calculateField(point.x, point.y) < 1) {
              point.x += (ball.x - point.x) * 0.1
              point.y += (ball.y - point.y) * 0.1
            }
          } else {
            const distToTarget = Math.hypot(
              point.targetX - point.x,
              point.targetY - point.y,
            )

            if (distToTarget > 100 || Math.random() < 0.001) {
              const dist = Math.hypot(ball.x - point.x, ball.y - point.y)
              if (dist < 200 + Math.random() * 100) {
                point.targetX = ball.x + (Math.random() * 2 - 1) * 100
                point.targetY = ball.y + (Math.random() * 2 - 1) * 100
              }
            }

            point.x += (point.targetX - point.x) * 0.01
            point.y += (point.targetY - point.y) * 0.01
          }

          point.x += Math.sin(time * 0.3 + point.y * 0.01) * 0.1
          point.y += Math.cos(time * 0.3 + point.x * 0.01) * 0.1

          if (point.x < 0) point.x = width
          if (point.x > width) point.x = 0
          if (point.y < 0) point.y = height
          if (point.y > height) point.y = 0

          let alpha: number
          if (point.active) {
            alpha = Math.min(0.9, 0.3 + field * 0.4)
          } else {
            const dist = Math.hypot(point.x - ball.x, point.y - ball.y)
            const proximity = Math.max(0, 1 - dist / (ball.radius * 2.5))
            alpha = 0.05 + proximity * 0.2
          }

          ctx.fillStyle = `rgba(51, 51, 51, ${alpha})`
          ctx.beginPath()
          ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2)
          ctx.fill()
        }

        lastFrameTime = currentTime - (deltaTime % frameInterval)
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    resize()
    animationFrameId = requestAnimationFrame(animate)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      ctx.clearRect(0, 0, width, height)
      points.length = 0
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      style={{ transition: 'opacity 0.4s ease' }}
    />
  )
}
