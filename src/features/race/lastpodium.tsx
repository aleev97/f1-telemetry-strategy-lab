import { useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import clsx from 'clsx'
import { Card } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/errorstate'
import { useAsync } from '@/hooks/useasync'
import { getLastEdition } from '@/lib/api/jolpica'

// Índice 0 = P1, 1 = P2, 2 = P3
const STYLES = [
  { order: 'md:order-2', height: 'md:min-h-[18rem]', delay: 0.5 },
  { order: 'md:order-1', height: 'md:min-h-[15rem]', delay: 0.25 },
  { order: 'md:order-3', height: 'md:min-h-[13rem]', delay: 0 },
]

interface LastPodiumProps {
  circuitId: string
  /** Temporada de la que se muestra el podio */
  season: number
}

export function LastPodium({ circuitId, season }: LastPodiumProps) {
  const reduceMotion = useReducedMotion()

  const fetcher = useCallback(
    (signal: AbortSignal) => getLastEdition(circuitId, season, signal),
    [circuitId, season],
  )
  const result = useAsync(fetcher)

  if (result.status === 'loading') {
    return (
      <div
        className="h-72 animate-pulse rounded-xl border border-white/10 bg-surface"
        aria-busy="true"
      />
    )
  }

  if (result.status === 'error') {
    return <ErrorState error={result.error} onRetry={result.reload} />
  }

  if (!result.data) {
    return (
      <Card>
        <h2 className="text-sm font-bold uppercase tracking-widest">Podio de {season}</h2>
        <p className="mt-3 text-sm text-muted">
          Este circuito no estuvo en el calendario de {season}, así que no hay una edición anterior
          que mostrar.
        </p>
      </Card>
    )
  }

  const { raceName, podium } = result.data

  return (
    <Card>
      <h2 className="text-sm font-bold uppercase tracking-widest">Podio de {season}</h2>
      <p className="mt-1 text-xs text-muted">{raceName}</p>

      <ol className="mt-6 grid items-end gap-3 md:grid-cols-3">
        {podium.map((entry, i) => {
          const style = STYLES[i] ?? STYLES[2]
          const isWinner = i === 0

          return (
            <motion.li
              key={entry.position}
              className={clsx(
                'relative flex flex-col justify-end overflow-hidden rounded-xl border p-5',
                style.order,
                style.height,
                isWinner ? 'glow-team border-team/50 bg-team/10' : 'border-white/10 bg-surface',
              )}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : style.delay, ease: 'easeOut' }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -top-4 select-none font-display text-[9rem] font-black italic leading-none text-transparent"
                style={{
                  WebkitTextStroke: `2px ${
                    isWinner ? 'color-mix(in srgb, var(--team) 60%, transparent)' : 'rgb(255 255 255 / 0.18)'
                  }`,
                }}
              >
                {entry.position}
              </span>

              <div className="relative">
                <p className="text-xs text-muted">{entry.firstName}</p>
                <p className="font-display text-3xl font-black uppercase italic leading-none">
                  {entry.lastName}
                </p>
                <p
                  className={clsx(
                    'mt-2 text-xs uppercase tracking-widest',
                    isWinner ? 'text-team' : 'text-muted',
                  )}
                >
                  {entry.team}
                </p>
                {entry.time && (
                  <p className="mt-3 text-sm font-bold tabular-nums">{entry.time}</p>
                )}
              </div>
            </motion.li>
          )
        })}
      </ol>
    </Card>
  )
}