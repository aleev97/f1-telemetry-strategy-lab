import { motion, useReducedMotion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/errorstate'
import { driverColor } from '@/lib/teams'
import { TYRES } from '@/lib/tyres'
import type { Driver, Stint } from '@/types/f1'
import { compoundSequence, pitLaps, raceLaps } from './strategy'
import { useDriverStints } from './usedriverstints'

function StintBar({ stints, total }: { stints: Stint[]; total: number }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative h-9 overflow-hidden rounded-md bg-white/5">
      {stints.map((s, i) => {
        const tyre = TYRES[s.compound]
        const laps = s.lapEnd - s.lapStart + 1

        return (
          <motion.div
            key={s.number}
            title={`${tyre.label} · vueltas ${s.lapStart}–${s.lapEnd} (${laps})`}
            className="absolute inset-y-0 flex items-center justify-center border-r-2 border-base text-xs font-bold"
            style={{
              left: `${((s.lapStart - 1) / total) * 100}%`,
              width: `${(laps / total) * 100}%`,
              backgroundColor: tyre.color,
              color: '#0B0E14',
              originX: 0,
            }}
            initial={{ scaleX: reduceMotion ? 1 : 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : i * 0.12, ease: 'easeOut' }}
          >
            {tyre.letter}
          </motion.div>
        )
      })}
    </div>
  )
}

function LapAxis({ total }: { total: number }) {
  const ticks = Array.from({ length: Math.floor(total / 10) }, (_, i) => (i + 1) * 10)

  return (
    <div className="relative mt-1 h-4 text-[10px] text-muted" aria-hidden="true">
      {ticks.map((lap) => (
        <span
          key={lap}
          className="absolute -translate-x-1/2"
          style={{ left: `${(lap / total) * 100}%` }}
        >
          {lap}
        </span>
      ))}
    </div>
  )
}

function DriverStrategyRow({
  driver,
  stints,
  total,
}: {
  driver: Driver
  stints: Stint[]
  total: number
}) {
  const pits = pitLaps(stints)

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: driverColor(driver) }} />
        <span className="font-bold">{driver.acronym}</span>
        {stints.length > 0 && (
          <span className="text-muted">
            {pits.length} {pits.length === 1 ? 'parada' : 'paradas'} · {compoundSequence(stints)}
            {pits.length > 0 && ` · ${pits.map((lap) => `V${lap}`).join(', ')}`}
          </span>
        )}
      </div>

      {stints.length === 0 ? (
        <p className="text-xs text-muted">Sin datos de neumáticos para este piloto.</p>
      ) : (
        <StintBar stints={stints} total={total} />
      )}
    </div>
  )
}

interface TyreStrategyProps {
  sessionKey: number
  driverA: Driver
  driverB: Driver
}

export function TyreStrategy({ sessionKey, driverA, driverB }: TyreStrategyProps) {
  const resA = useDriverStints(sessionKey, driverA.number)
  const resB = useDriverStints(sessionKey, driverB.number)

  const failed = resA.status === 'error' ? resA : resB.status === 'error' ? resB : null
  if (failed) {
    return (
      <div className="mt-6">
        <ErrorState error={failed.error} onRetry={failed.reload} />
      </div>
    )
  }

  if (resA.status !== 'success' || resB.status !== 'success') {
    return (
      <div
        className="mt-6 h-44 animate-pulse rounded-xl border border-white/10 bg-surface"
        aria-busy="true"
      />
    )
  }

  const stintsA = resA.data
  const stintsB = resB.data
  const total = raceLaps(stintsA, stintsB)

  if (total === 0) {
    return (
      <Card className="mt-6 text-center text-sm text-muted">
        No hay datos de neumáticos para esta carrera.
      </Card>
    )
  }

  const compounds = [...new Set([...stintsA, ...stintsB].map((s) => s.compound))]

  // Comparación de la primera ventana de parada
  const firstA = pitLaps(stintsA)[0]
  const firstB = pitLaps(stintsB)[0]
  const delta = firstA !== undefined && firstB !== undefined ? firstB - firstA : null

  return (
    <Card className="mt-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-widest">Neumáticos y paradas</h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {compounds.map((c) => (
            <li key={c} className="flex items-center gap-1.5 text-xs text-muted">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: TYRES[c].color }} />
              {TYRES[c].label}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-5">
        <DriverStrategyRow driver={driverA} stints={stintsA} total={total} />
        <DriverStrategyRow driver={driverB} stints={stintsB} total={total} />
      </div>

      <LapAxis total={total} />
      <p className="mt-1 text-center text-[10px] uppercase tracking-widest text-muted">Vuelta</p>

      {delta !== null && (
        <p className="mt-4 border-t border-white/10 pt-3 text-xs text-muted">
          {delta === 0
            ? 'Ambos hicieron su primera parada en la misma vuelta.'
            : `${driverB.acronym} hizo su primera parada ${Math.abs(delta)} ${
                Math.abs(delta) === 1 ? 'vuelta' : 'vueltas'
              } ${delta > 0 ? 'después' : 'antes'} que ${driverA.acronym}.`}
        </p>
      )}
    </Card>
  )
}