import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import type { Race } from '@/types/f1'
import { CircuitTrace } from './circuittrace'
import { SpotlightCard } from './spotlightcard'

const dateFormat = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
})

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export function RaceCard({ race }: { race: Race }) {
  return (
    <motion.li variants={itemVariants}>
      <Link
        to={`/race/${race.round}`}
        className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-team"
      >
        <SpotlightCard className="h-full">
          <div className="flex items-center justify-between">
            <Badge>R{String(race.round).padStart(2, '0')}</Badge>
            <time dateTime={race.startsAt} className="text-xs uppercase tracking-widest text-muted">
              {dateFormat.format(new Date(race.startsAt))}
            </time>
          </div>

          <CircuitTrace circuitId={race.circuitId} className="mt-4 h-28 w-full" />

          <h3 className="mt-4 font-display text-2xl font-extrabold uppercase italic leading-none">
            {race.name}
          </h3>
          <p className="mt-2 text-xs text-muted">{race.circuitName}</p>
          <p className="mt-3 text-xs uppercase tracking-widest">
            {race.locality}, {race.country}
          </p>

          <p className="mt-4 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-team">
            Ver detalle
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
          </p>
        </SpotlightCard>
      </Link>
    </motion.li>
  )
}