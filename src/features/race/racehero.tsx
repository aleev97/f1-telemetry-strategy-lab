import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import type { Race } from '@/types/f1'
import { CircuitTrace } from '@/features/calendar/circuittrace'

const longDate = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full' })

function statusLabel(startsAt: string, now: number): string {
  const days = Math.ceil((new Date(startsAt).getTime() - now) / 86_400_000)
  if (new Date(startsAt).getTime() <= now) return 'Finalizada'
  return days === 1 ? 'Falta 1 día' : `Faltan ${days} días`
}

export function RaceHero({ race }: { race: Race }) {
  // El estado no necesita precisión al segundo: se fija al montar
  const [now] = useState(() => Date.now())
  const round = String(race.round).padStart(2, '0')

  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-team/20 via-surface to-team-2/10 p-6 sm:p-10">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -left-4 select-none font-display text-[18rem] font-black italic leading-none text-transparent sm:text-[26rem]"
        style={{ WebkitTextStroke: '2px color-mix(in srgb, var(--team) 25%, transparent)' }}
      >
        {round}
      </span>

      <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Calendario
          </Link>

          <div className="mt-4">
            <Badge>
              R{round} · {statusLabel(race.startsAt, now)}
            </Badge>
          </div>

          <h1 className="mt-4 font-display text-5xl font-black uppercase italic leading-[0.9] sm:text-7xl">
            {race.name}
          </h1>
          <p className="mt-3 text-xs uppercase tracking-widest text-muted">
            {race.circuitName} · {race.locality}, {race.country}
          </p>
          <p className="mt-6 text-sm first-letter:uppercase">
            {longDate.format(new Date(race.startsAt))}
          </p>
        </div>

        <CircuitTrace
          circuitId={race.circuitId}
          className="mx-auto h-56 w-full max-w-md sm:h-72"
        />
      </div>
    </section>
  )
}