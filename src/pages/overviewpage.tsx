import { PageHeader } from '@/components/ui/pageheader'
import { ErrorState } from '@/components/ui/errorstate'
import { CalendarBrowser } from '@/features/calendar/calendarbrowser'
import { NextRaceCountdown } from '@/features/calendar/nextracecountdown'
import { RaceTicker } from '@/features/calendar/raceticker'
import { StartLights } from '@/features/calendar/startlights'
import { useAsync } from '@/hooks/useasync'
import { getSeasonCalendar } from '@/lib/api/jolpica'
import { CURRENT_SEASON as SEASON } from '@/lib/season'

// A nivel de módulo → identidad estable entre renders (clave para useAsync)
const fetchCalendar = (signal: AbortSignal) => getSeasonCalendar(SEASON, signal)

export default function OverviewPage() {
  const calendar = useAsync(fetchCalendar)

  return (
    <>
      <StartLights />

      {calendar.status === 'loading' && (
        <div
          className="mb-10 h-80 animate-pulse rounded-3xl border border-white/10 bg-surface"
          aria-busy="true"
        />
      )}

      {calendar.status === 'error' && (
        <div className="mb-10">
          <ErrorState error={calendar.error} onRetry={calendar.reload} />
        </div>
      )}

      {calendar.status === 'success' && (
        <>
          <RaceTicker races={calendar.data} />
          {/* El hero recibe la lista COMPLETA, no la filtrada */}
          <NextRaceCountdown races={calendar.data} />
        </>
      )}

      <PageHeader
        eyebrow={`Temporada ${SEASON}`}
        title="Calendario de la temporada"
        description="Todas las carreras, con búsqueda y filtros guardados en la URL."
      />

      {calendar.status === 'loading' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-60 animate-pulse rounded-xl border border-white/10 bg-surface" />
          ))}
        </div>
      )}

      {calendar.status === 'success' && <CalendarBrowser races={calendar.data} />}
    </>
  )
}