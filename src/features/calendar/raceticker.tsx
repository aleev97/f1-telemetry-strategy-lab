import { useState } from 'react'
import clsx from 'clsx'
import type { Race } from '@/types/f1'
import { getNextRace } from './countdown'

const dateFormat = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })

export function RaceTicker({ races }: { races: Race[] }) {
  // "Ahora" fijo al montar: el ticker no necesita precisión al segundo
  const [now] = useState(() => Date.now())
  const nextRound = getNextRace(races, now)?.round

  const row = (copy: 'a' | 'b') => (
    <ul key={copy} className="flex shrink-0 items-center gap-10 pr-10">
      {races.map((race) => {
        const isPast = new Date(race.startsAt).getTime() <= now
        return (
          <li
            key={race.round}
            className={clsx(
              'flex items-center gap-3 whitespace-nowrap font-display text-lg font-extrabold uppercase italic tracking-wide',
              isPast ? 'text-white/30' : race.round === nextRound ? 'text-team' : 'text-white',
            )}
          >
            <span className="text-team">R{String(race.round).padStart(2, '0')}</span>
            {race.country}
            <span className="font-mono text-xs font-normal not-italic text-muted">
              {dateFormat.format(new Date(race.startsAt))}
            </span>
            <span className="text-team-2">◆</span>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div
      aria-hidden="true"
      className="mb-6 overflow-hidden border-y border-white/10 py-3 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:overflow-x-auto"
    >
      {/* Dos copias idénticas; al desplazar el 50 % el bucle es invisible */}
      <div className="animate-marquee flex w-max hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row('a')}
        {row('b')}
      </div>
    </div>
  )
}