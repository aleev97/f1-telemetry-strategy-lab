import { motion, useReducedMotion } from 'framer-motion'
import { Flag } from 'lucide-react'
import { getCircuitTrace } from './circuits'

export function CircuitTrace({ circuitId, className }: { circuitId: string; className?: string }) {
  const trace = getCircuitTrace(circuitId)
  const reduceMotion = useReducedMotion()

  if (!trace) {
    return (
      <div className={`flex items-center justify-center gap-2 text-xs text-muted ${className ?? ''}`}>
        <Flag className="size-4" />
        Trazado no disponible
      </div>
    )
  }

  return (
    <svg
      viewBox={trace.viewBox}
      role="img"
      aria-label="Trazado del circuito"
      className={className}
      style={{ filter: 'drop-shadow(0 0 3px var(--team))' }}
    >
      <motion.path
        d={trace.path}
        fill="none"
        className="stroke-team"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduceMotion ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />
    </svg>
  )
}