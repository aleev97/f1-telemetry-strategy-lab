import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Race } from '@/types/f1'
import { CalendarFilters } from './calendarfilters'
import { RaceCard } from './racecard'
import { filterRaces } from './filters'
import { useCalendarFilters } from './usecalendarfilters'

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

export function CalendarBrowser({ races }: { races: Race[] }) {
  const { q, status, setQuery, setStatus, reset } = useCalendarFilters()

  // "Ahora" se fija al montar: el filtro de estado no necesita precisión al segundo
  const [now] = useState(() => Date.now())

  const visible = filterRaces(races, { q, status }, now)
  const hasFilters = q !== '' || status !== 'all'

  return (
    <section>
      <CalendarFilters
        q={q}
        status={status}
        shown={visible.length}
        total={races.length}
        hasFilters={hasFilters}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
        onReset={reset}
      />

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-muted">
          Ningún Gran Premio coincide con tu búsqueda.
        </p>
      ) : (
        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((race) => (
            <RaceCard key={race.round} race={race} />
          ))}
        </motion.ul>
      )}
    </section>
  )
}