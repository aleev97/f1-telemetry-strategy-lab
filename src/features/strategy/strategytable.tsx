import clsx from 'clsx'
import { Panel } from '@/components/ui/panel'
import { formatDelta, formatRaceTime, type Candidate, type PlannedStint } from './engine'

interface Row {
  label: string
  stints: PlannedStint[]
  totalSec: number
}

interface StrategyTableProps {
  userStints: PlannedStint[]
  userTotal: number
  candidates: Candidate[]
  bestTotal: number
}

export function StrategyTable({ userStints, userTotal, candidates, bestTotal }: StrategyTableProps) {
  const stopsLabel = (n: number) => `${n} ${n === 1 ? 'parada' : 'paradas'}`

  const rows: Row[] = [
    { label: `Tu estrategia (${stopsLabel(userStints.length - 1)})`, stints: userStints, totalSec: userTotal },
    ...candidates.map((c) => ({
      label: `Mejor con ${stopsLabel(c.stints.length - 1)}`,
      stints: c.stints,
      totalSec: c.totalSec,
    })),
  ]

  return (
          <Panel title="Comparación de estrategias">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-xs">
          <thead className="text-[10px] uppercase tracking-widest text-muted">
            <tr>
              <th className="pb-2 font-normal">Estrategia</th>
              <th className="pb-2 font-normal">Plan</th>
              <th className="pb-2 text-right font-normal">Tiempo</th>
              <th className="pb-2 text-right font-normal">Delta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const delta = row.totalSec - bestTotal
              const isBest = delta < 0.0005

              return (
                <tr key={row.label} className={clsx('border-t border-white/10', i === 0 && 'bg-white/5')}>
                  <td className="py-3 pr-3 font-bold">{row.label}</td>
                                    <td
                    className={clsx(
                      'py-3 pr-3 text-right tabular-nums',
                      isBest && 'font-bold text-timing-purple',
                    )}
                  >
                    {formatRaceTime(row.totalSec)}
                  </td>
                  <td
                    className={clsx(
                      'py-3 text-right font-bold tabular-nums',
                      isBest
                        ? 'text-timing-purple'
                        : delta <= 1
                          ? 'text-timing-green'
                          : 'text-timing-yellow',
                    )}
                  >
                    {isBest ? 'Óptima' : formatDelta(delta)}
                  </td>
                  <td className="py-3 pr-3 text-right tabular-nums">{formatRaceTime(row.totalSec)}</td>
                                    <td
                    className={clsx(
                      'py-3 pr-3 text-right tabular-nums',
                      isBest && 'font-bold text-timing-purple',
                    )}
                  >
                    {formatRaceTime(row.totalSec)}
                  </td>
                  <td
                    className={clsx(
                      'py-3 text-right font-bold tabular-nums',
                      isBest
                        ? 'text-timing-purple'
                        : delta <= 1
                          ? 'text-timing-green'
                          : 'text-timing-yellow',
                    )}
                  >
                    {isBest ? 'Óptima' : formatDelta(delta)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] text-muted">
        Las alternativas usan entre 1 y 3 paradas, stints de al menos {5} vueltas y dos compuestos
        distintos como mínimo.
      </p>
    </Panel>
  )
}