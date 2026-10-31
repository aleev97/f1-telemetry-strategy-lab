import { useState } from 'react'
import clsx from 'clsx'
import { Card } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/errorstate'
import { driverColor } from '@/lib/teams'
import type { Driver } from '@/types/f1'
import type { XAxisMode } from './chardata'
import { SpeedChart } from './speedchart'
import { useFastestLapTelemetry } from './usefastestlaptelemetry'
import { VersusBanner } from './versusbanner'

const MODES: { value: XAxisMode; label: string }[] = [
  { value: 'distance', label: 'Distancia' },
  { value: 'time', label: 'Tiempo' },
]

function LegendItem({ driver, dashed }: { driver: Driver; dashed: boolean }) {
  return (
    <p className="flex items-center gap-2 text-xs">
      <span
        className="w-5 border-t-2"
        style={{ borderColor: driverColor(driver), borderStyle: dashed ? 'dashed' : 'solid' }}
      />
      <span className="font-bold">{driver.acronym}</span>
    </p>
  )
}

interface TelemetrySectionProps {
  sessionKey: number | null
  driverA: Driver | null
  driverB: Driver | null
}

export function TelemetrySection({ sessionKey, driverA, driverB }: TelemetrySectionProps) {
  // Estado efímero de UI (no compartible): useState local
  const [mode, setMode] = useState<XAxisMode>('distance')

  const resA = useFastestLapTelemetry(sessionKey, driverA?.number ?? null)
  const resB = useFastestLapTelemetry(sessionKey, driverB?.number ?? null)

  // undefined = cargando · null = sin vuelta válida · objeto = datos
  const lapA = resA.status === 'success' ? resA.data : undefined
  const lapB = resB.status === 'success' ? resB.data : undefined

  const banner = <VersusBanner driverA={driverA} driverB={driverB} lapA={lapA} lapB={lapB} />

  if (!driverA || !driverB) return banner

  const failed = resA.status === 'error' ? resA : resB.status === 'error' ? resB : null
  if (failed) {
    return (
      <>
        {banner}
        <div className="mt-6">
          <ErrorState error={failed.error} onRetry={failed.reload} />
        </div>
      </>
    )
  }

  if (lapA === undefined || lapB === undefined) {
    return (
      <>
        {banner}
        <div
          className="mt-6 h-96 animate-pulse rounded-xl border border-white/10 bg-surface"
          aria-busy="true"
        />
      </>
    )
  }

  if (!lapA || !lapB) {
    const missing = !lapA ? driverA : driverB
    return (
      <>
        {banner}
        <Card className="mt-6 text-center text-sm text-muted">
          No hay una vuelta válida con telemetría para {missing.acronym} en esta carrera.
        </Card>
      </>
    )
  }

  // Compañeros de equipo → mismo color: el piloto B se dibuja discontinuo
  const sameColor = driverColor(driverA).toLowerCase() === driverColor(driverB).toLowerCase()

  return (
    <>
      {banner}

      <Card className="mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest">
              Velocidad · vuelta más rápida
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
              <LegendItem driver={driverA} dashed={false} />
              <LegendItem driver={driverB} dashed={sameColor} />
            </div>
          </div>

          <div className="inline-flex rounded-lg border border-white/10 p-1">
            {MODES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={clsx(
                  'rounded-md border px-3 py-1.5 text-xs uppercase tracking-widest transition-colors',
                  mode === value
                    ? 'border-team/40 bg-team/20 text-white'
                    : 'border-transparent text-muted hover:text-white',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <SpeedChart
          telemetryA={lapA}
          telemetryB={lapB}
          driverA={driverA}
          driverB={driverB}
          mode={mode}
        />

        <p className="mt-3 text-[11px] text-muted">
          Cada piloto en su vuelta más rápida de la carrera, con combustible y neumáticos distintos. La
          distancia es aproximada (se integra la velocidad).
        </p>
      </Card>
    </>
  )
}