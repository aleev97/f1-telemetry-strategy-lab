import { useCallback } from 'react'
import { TelemetrySection } from '@/features/telemetry/telemetryselection'
import { PageHeader } from '@/components/ui/pageheader'
import { ErrorState } from '@/components/ui/errorstate'
import { Select } from '@/components/ui/select'
import { AVAILABLE_YEARS, useTelemetrySelection } from '@/features/telemetry/usetelemetryselection'
import { useAsync } from '@/hooks/useasync'
import { getRaceSessions, getSessionDrivers } from '@/lib/api/openf1'
import type { Driver } from '@/types/f1'
import { TyreStrategy } from '@/features/telemetry/tyrestrategy'

const dateFormat = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })

export default function TelemetryPage() {
  const { year, sessionKey, a, b, setYear, setSession, setDriverA, setDriverB } =
    useTelemetrySelection()

  // Cambia la identidad cuando cambia `year` → useAsync vuelve a "loading" solo
  const fetchSessions = useCallback(
    (signal: AbortSignal) =>
      getRaceSessions(year, signal).then((list) =>
        list.filter((s) => new Date(s.startsAt).getTime() < Date.now()),
      ),
    [year],
  )
  const sessionsResult = useAsync(fetchSessions)

  const fetchDrivers = useCallback(
    (signal: AbortSignal): Promise<Driver[]> =>
      sessionKey ? getSessionDrivers(sessionKey, signal) : Promise.resolve([]),
    [sessionKey],
  )
  const driversResult = useAsync(fetchDrivers)

  const sessions = sessionsResult.status === 'success' ? sessionsResult.data : []
  const drivers =
    driversResult.status === 'success'
      ? [...driversResult.data].sort(
          (x, y) => (x.teamName ?? '').localeCompare(y.teamName ?? '') || x.number - y.number,
        )
      : []

  // Derivamos los objetos a partir de los IDs de la URL
  const driverA = drivers.find((d) => d.number === a) ?? null
  const driverB = drivers.find((d) => d.number === b) ?? null

  const failed =
    sessionsResult.status === 'error'
      ? sessionsResult
      : driversResult.status === 'error'
        ? driversResult
        : null

  const driverOptions = (exclude: Driver | null) =>
    drivers
      .filter((d) => d.number !== exclude?.number)
      .map((d) => ({ value: String(d.number), label: `${d.acronym} · ${d.fullName}` }))

  const sessionValue = sessions.some((s) => s.sessionKey === sessionKey) ? String(sessionKey) : ''
  const driversDisabled = sessionKey === null || driversResult.status !== 'success'

  return (
    <>
      <PageHeader
        eyebrow="Telemetry"
        title="Comparación de pilotos"
        description="Elige una carrera y dos pilotos. La selección queda guardada en la URL."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Temporada"
          value={String(year)}
          onChange={(v) => setYear(Number(v))}
          options={AVAILABLE_YEARS.map((y) => ({ value: String(y), label: String(y) }))}
          placeholder="Temporada"
        />
        <Select
          label="Carrera"
          value={sessionValue}
          onChange={setSession}
          disabled={sessionsResult.status !== 'success'}
          options={sessions.map((s) => ({
            value: String(s.sessionKey),
            label: `${s.country} · ${s.circuit} (${dateFormat.format(new Date(s.startsAt))})`,
          }))}
          placeholder={
            sessionsResult.status === 'loading'
              ? 'Cargando carreras…'
              : sessions.length > 0
                ? 'Elige una carrera'
                : 'Sin carreras disputadas'
          }
        />
        <Select
          label="Piloto A"
          value={driverA ? String(driverA.number) : ''}
          onChange={setDriverA}
          disabled={driversDisabled}
          options={driverOptions(driverB)}
          placeholder="Elige el piloto A"
        />
        <Select
          label="Piloto B"
          value={driverB ? String(driverB.number) : ''}
          onChange={setDriverB}
          disabled={driversDisabled}
          options={driverOptions(driverA)}
          placeholder="Elige el piloto B"
        />
      </div>

      {failed && <ErrorState error={failed.error} onRetry={failed.reload} />}

      <TelemetrySection sessionKey={sessionKey} driverA={driverA} driverB={driverB} />
      
      {sessionKey !== null && driverA && driverB && (
        <TyreStrategy sessionKey={sessionKey} driverA={driverA} driverB={driverB} />
      )}
    </>
  )
}