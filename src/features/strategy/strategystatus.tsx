import clsx from 'clsx'
import { useFormContext, useWatch } from 'react-hook-form'
import { Panel } from '@/components/ui/panel'
import { TYRES } from '@/lib/tyres'
import { stintPlanIssues, type StrategyFormValues } from './schema'

const finiteOr0 = (n: number) => (Number.isFinite(n) ? n : 0)

export function StrategyStatus() {
  const {
    control,
    formState: { isValid },
  } = useFormContext<StrategyFormValues>()

  const raceLaps = finiteOr0(useWatch({ control, name: 'raceLaps' }))
  const stints = useWatch({ control, name: 'stints' }).map((s) => ({
    compound: s.compound,
    laps: finiteOr0(s.laps),
  }))

  const assigned = stints.reduce((sum, s) => sum + s.laps, 0)
  const issues = raceLaps > 0 ? stintPlanIssues(raceLaps, stints) : []
  const scale = Math.max(assigned, raceLaps, 1)

  return (
    <Panel
      title="Estado de la estrategia"
      led={isValid ? 'ok' : 'warn'}
      className="lg:sticky lg:top-24"
      aside={
        <span
          className={clsx(
            'text-[11px] font-bold uppercase tracking-widest',
            isValid ? 'text-timing-green' : 'text-timing-yellow',
          )}
        >
          {isValid ? 'Válida' : 'Revisa los campos'}
        </span>
      }
    >
      <p className="mb-2 text-xs text-muted">
        Vueltas asignadas:{' '}
        <span
          className={clsx(
            'font-bold',
            assigned === raceLaps ? 'text-timing-green' : 'text-timing-yellow',
          )}
        >
          {assigned} / {raceLaps}
        </span>
      </p>

      <div className="flex h-9 overflow-hidden rounded-md bg-white/5" aria-hidden="true">
        {stints.map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-center border-r-2 border-base text-xs font-bold transition-[width] duration-300"
            style={{
              width: `${(s.laps / scale) * 100}%`,
              backgroundColor: TYRES[s.compound].color,
              color: '#0B0E14',
            }}
          >
            {TYRES[s.compound].letter}
          </div>
        ))}
      </div>

      {issues.length > 0 && (
        <ul className="mt-4 space-y-1 text-xs text-timing-yellow" role="status">
          {issues.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <p className="mt-6 border-t border-white/10 pt-4 text-xs text-muted">
        Modelo simplificado: ritmo + degradación lineal por vuelta y un tiempo fijo por parada. Ignora
        combustible, tráfico y safety car; sirve para comparar estrategias, no para predecir una carrera.
      </p>
    </Panel>
  )
}