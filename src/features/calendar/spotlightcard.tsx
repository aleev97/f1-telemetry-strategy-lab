import { useRef, type PointerEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import clsx from 'clsx'

const SPRING = { stiffness: 200, damping: 20 }

export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  // Posición del cursor normalizada (0–1). Cambia sin provocar re-renders
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [6, -6]), SPRING)
  const rotateY = useSpring(useTransform(px, [0, 1], [-6, 6]), SPRING)

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    // Solo con ratón: en pantallas táctiles no hay "hover"
    if (e.pointerType !== 'mouse' || !ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ref.current.style.setProperty('--mx', `${x}px`)
    ref.current.style.setProperty('--my', `${y}px`)

    if (!reduceMotion) {
      px.set(x / rect.width)
      py.set(y / rect.height)
    }
  }

  function handlePointerLeave() {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={clsx(
        'group relative overflow-hidden rounded-xl border border-white/10 bg-surface transition-shadow duration-300 hover:glow-team',
        className,
      )}
    >
      {/* Foco de luz que sigue al cursor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--team) 22%, transparent), transparent 70%)',
        }}
      />
      <div className="relative p-5">{children}</div>
    </motion.div>
  )
}