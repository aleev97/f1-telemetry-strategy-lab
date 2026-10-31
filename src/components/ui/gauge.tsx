import { motion, useReducedMotion } from 'framer-motion'

type Tone = 'purple' | 'green' | 'yellow' | 'team'

const TONES: Record<Tone, string> = {
  purple: '#B14AFF',
  green: '#00E676',
  yellow: '#FFD60A',
  team: 'var(--team)',
}

// Arco de 270°: de abajo-izquierda a abajo-derecha, pasando por arriba
const ARC = 'M 21.7 78.3 A 40 40 0 1 1 78.3 78.3'

interface GaugeProps {
  label: string
  value: number
  /** Valor que llena el arco por completo */
  max: number
  /** Texto que se muestra en el centro */
  display: string
  unit?: string
  tone: Tone
}

export function Gauge({ label, value, max, display, unit, tone }: GaugeProps) {
  const reduceMotion = useReducedMotion()
  const ratio = Math.min(1, Math.max(0, value / max))
  const color = TONES[tone]

  return (
    <figure
      className="flex flex-col items-center gap-1"
      role="img"
      aria-label={`${label}: ${display}${unit ? ` ${unit}` : ''}`}
    >
      <div className="relative size-24 sm:size-32">
        <svg
          viewBox="0 0 100 100"
          className="size-full"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          aria-hidden="true"
        >
          <path d={ARC} fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="7" strokeLinecap="round" />
          <motion.path
            d={ARC}
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            style={{ stroke: color }}
            initial={{ pathLength: reduceMotion ? ratio : 0, opacity: ratio === 0 ? 0 : 1 }}
            animate={{ pathLength: ratio, opacity: ratio === 0 ? 0 : 1 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 18 }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-xl font-bold tabular-nums sm:text-2xl">{display}</span>
          {unit && <span className="text-[10px] uppercase tracking-widest text-muted">{unit}</span>}
        </div>
      </div>

      <figcaption className="text-[10px] uppercase tracking-widest text-muted">{label}</figcaption>
    </figure>
  )
}