import { Link, useParams } from 'react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ErrorState } from '@/components/ui/errorstate'
import { LastPodium } from '@/features/race/lastpodium'
import { RaceHero } from '@/features/race/racehero'
import { WeekendSchedule } from '@/features/race/weekendSchedule'
import { useAsync } from '@/hooks/useasync'
import { getSeasonCalendar } from '@/lib/api/jolpica'
import { CURRENT_SEASON } from '@/lib/season'
import NotFoundPage from './notfoundpage'

// A nivel de módulo → identidad estable entre renders (clave para useAsync)
const fetchCalendar = (signal: AbortSignal) => getSeasonCalendar(CURRENT_SEASON, signal)

export default function RaceDetailPage() {
  const { round: roundParam } = useParams()
  const calendar = useAsync(fetchCalendar)

  // El parámetro de la URL no es de fiar: se valida antes de usarlo
  const round = Number(roundParam)
  if (!Number.isInteger(round) || round < 1) return <NotFoundPage />

  if (calendar.status === 'loading') {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-80 animate-pulse rounded-3xl border border-white/10 bg-surface" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-xl border border-white/10 bg-surface" />
          <div className="h-96 animate-pulse rounded-xl border border-white/10 bg-surface" />
        </div>
      </div>
    )
  }

  if (calendar.status === 'error') {
    return <ErrorState error={calendar.error} onRetry={calendar.reload} />
  }

  const races = calendar.data
  const race = races.find((r) => r.round === round)
  if (!race) return <NotFoundPage />

  const prev = races.find((r) => r.round === round - 1)
  const next = races.find((r) => r.round === round + 1)

  return (
    <>
      <RaceHero race={race} />

      <div className="grid gap-6 lg:grid-cols-2">
        <WeekendSchedule sessions={race.sessions} />
        <LastPodium circuitId={race.circuitId} season={CURRENT_SEASON - 1} />
      </div>

      <nav aria-label="Navegación entre carreras" className="mt-8 flex items-center justify-between gap-4">
        {prev ? (
          <Link
            to={`/race/${prev.round}`}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            R{String(prev.round).padStart(2, '0')} · {prev.country}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            to={`/race/${next.round}`}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted transition-colors hover:text-white"
          >
            R{String(next.round).padStart(2, '0')} · {next.country}
            <ArrowRight className="size-4" />
          </Link>
        )}
      </nav>
    </>
  )
}