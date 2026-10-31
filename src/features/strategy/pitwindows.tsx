import { Panel } from '@/components/ui/panel'
import { formatDelta, type PitWindow } from './engine'

const pct = (lap: number, total: number) => `${(lap / total) * 100}%`

export function PitWindows({ windows, raceLaps }: { windows: PitWindow[]; raceLaps: number }) {
  return (
    <Panel title="Ventana de parada estimada">
      <p className="text-xs text-muted">
        Rango de vueltas en el que mover la parada cuesta menos de 1 s respecto a la óptima, dejando
        el resto del plan igual.
      </p>

      <ul className="mt-6 space-y-7">
        {windows.map((w) => (
          <li key={w.stop}>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs">
              <span className="font-bold uppercase tracking-widest">Parada {w.stop}</span>
              <span className="text-muted">
                Tu plan: V{w.currentLap} · Óptima: V{w.optimalLap} · Ventana: V{w.fromLap}–V{w.toLap} ·
                Coste: {w.costVsOptimalSec < 0.0005 ? 'óptima' : formatDelta(w.costVsOptimalSec)}
              </span>
            </div>

            <div className="relative h-2 rounded bg-white/5" aria-hidden="true">
              <div
                className="absolute inset-y-0 rounded bg-team/30"
                style={{
                  left: pct(w.fromLap - 1, raceLaps),
                  width: pct(w.toLap - w.fromLap + 1, raceLaps),
                }}
              />
              <div
                className="absolute -top-1 h-4 w-0.5 bg-team"
                style={{ left: pct(w.optimalLap - 0.5, raceLaps) }}
              />
              <div
                className="absolute -top-1 h-4 w-0.5 bg-white"
                style={{ left: pct(w.currentLap - 0.5, raceLaps) }}
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-[11px] text-muted">
        Franja = ventana · línea de color = vuelta óptima · línea blanca = tu plan.
      </p>
    </Panel>
  )
}