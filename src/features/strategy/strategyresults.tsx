import { useDeferredValue, useMemo } from 'react'
import clsx from 'clsx'
import { useFormContext, useWatch } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Gauge } from '@/components/ui/gauge'
import { Panel } from '@/components/ui/panel'
import { TYRES } from '@/lib/tyres'
import { DegradationChart } from './degradationchart'
import {
  bestStrategies,
  degradationLoss,
  formatDelta,
  formatRaceTime,
  pitWindows,
  raceTime,
} from './engine'
import { PitWindows } from './pitwindows'
import { strategySchema, type StrategyFormValues } from './schema'
import { StrategyTable } from './strategytable'

/** Umbral orientativo: hasta 3 s sobre la mejor estrategia se considera "verde" */
const GAP_GREEN_SEC = 3

function ResultsContent({ data }: { data: StrategyFormValues }) {
  // Se calcula con una copia diferida: React prioriza que el input responda al instante
  const deferred = useDeferredValue(data)
  const isStale = deferred !== data

  const analysis = useMemo(() => {
    const { stints, ...params } = deferred
    const userTotal = raceTime(params, stints)
    const candidates = bestStrategies(params)
    const bestTotal = Math.min(userTotal, ...candidates.map((c) => c.totalSec))

    return {
      params,
      stints,
      userTotal,
      candidates,
      bestTotal,
      windows: pitWindows(params, stints),
      degLoss: degradationLoss(params, stints),
      pitSeconds: params.pitLossSec * (stints.length - 1),
    }
  }, [deferred])

  const { params, stints, userTotal, candidates, bestTotal, windows, degLoss, pitSeconds } = analysis

  const delta = userTotal - bestTotal
  const isOptimal = delta < 0.0005
  const gapTone = isOptimal ? 'purple' : delta <= GAP_GREEN_SEC ? 'green' : 'yellow'
  const stopsCount = stints.length - 1

  return (
    <div className={clsx('space-y-6 transition-opacity', isStale && 'opacity-60')}>
      <Panel
        title="Resultado de la estrategia"
        led={gapTone === 'yellow' ? 'warn' : 'ok'}
        aside={
          <span
            className={clsx(
              'text-[11px] font-bold uppercase tracking-widest',
              gapTone === 'purple' && 'text-timing-purple',
              gapTone === 'green' && 'text-timing-green',
              gapTone === 'yellow' && 'text-timing-yellow',
            )}
          >
            {isOptimal ? 'Óptima del modelo' : `${formatDelta(delta)} vs. óptima`}
          </span>
        }
      >
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted">Tiempo total de carrera</p>
            <p className="mt-2 text-4xl font-bold tabular-nums text-team sm:text-6xl">
              {formatRaceTime(userTotal)}
            </p>
            <p className="mt-3 text-xs uppercase tracking-widest text-muted">
              {stopsCount} {stopsCount === 1 ? 'parada' : 'paradas'} ·{' '}
              {stints.map((s) => TYRES[s.compound].letter).join(' → ')}
            </p>
          </div>

          <div className="flex justify-center gap-2 sm:gap-6">
            <Gauge
              label="Vs. óptima"
              value={delta}
              max={10}
              display={isOptimal ? '0.0' : delta.toFixed(1)}
              unit="s"
              tone={gapTone}
            />
            <Gauge label="En boxes" value={pitSeconds} max={120} display={pitSeconds.toFixed(0)} unit="s" tone="team" />
            <Gauge label="Desgaste" value={degLoss} max={120} display={degLoss.toFixed(0)} unit="s" tone="team" />
          </div>
        </div>

        <p className="mt-6 border-t border-white/10 pt-4 text-[11px] text-muted">
          Los tres medidores muestran segundos perdidos: menos es mejor.{' '}
          <span className="text-timing-purple">Morado</span> = óptima ·{' '}
          <span className="text-timing-green">verde</span> = a {GAP_GREEN_SEC} s o menos ·{' '}
          <span className="text-timing-yellow">amarillo</span> = hay margen de mejora.
        </p>
      </Panel>

      <Panel title="Degradación por vuelta">
        <DegradationChart params={params} stints={stints} />
      </Panel>

      <PitWindows windows={windows} raceLaps={params.raceLaps} />

      <StrategyTable
        userStints={stints}
        userTotal={userTotal}
        candidates={candidates}
        bestTotal={bestTotal}
      />
    </div>
  )
}

export function StrategyResults() {
  const { control } = useFormContext<StrategyFormValues>()
  const values = useWatch({ control })

  // El schema es la puerta: si hay errores, el motor nunca recibe datos inválidos
  const parsed = useMemo(() => strategySchema.safeParse(values), [values])

  if (!parsed.success) {
    return (
      <Card className="text-center text-sm text-muted">
        Corrige los errores del formulario para ver los resultados.
      </Card>
    )
  }

  return <ResultsContent data={parsed.data} />
}