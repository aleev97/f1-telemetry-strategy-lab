import { motion, useReducedMotion } from 'framer-motion'
import clsx from 'clsx'
import { colorStyle, driverColor } from '@/lib/teams'
import type { Driver, LapTelemetry } from '@/types/f1'
import { formatLapTime } from './chardata'

/** undefined = cargando · null = sin vuelta válida · objeto = datos listos */
type LapState = LapTelemetry | null | undefined

function LapChip({ lap, fastest }: { lap: LapState; fastest: boolean }) {
  if (lap === undefined) {
    return <span className="block h-7 w-32 animate-pulse rounded bg-white/10" />
  }
  if (lap === null) {
    return <span className="text-xs text-muted">Sin vuelta válida</span>
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded border px-2.5 py-1 text-xs tabular-nums',
        fastest
          ? 'border-timing-purple/60 bg-timing-purple/15 text-timing-purple'
          : 'border-white/10 text-muted',
      )}
    >
      V{lap.lapNumber} · {formatLapTime(lap.durationSec)}
    </span>
  )
}

interface VersusSideProps {
  side: 'left' | 'right'
  driver: Driver | null
  lap: LapState
  fastest: boolean
}

function VersusSide({ side, driver, lap, fastest }: VersusSideProps) {
  const isLeft = side === 'left'
  const reduceMotion = useReducedMotion()
  const color = driver ? driverColor(driver) : '#8B93A7'

  return (
    <motion.div
      // Al cambiar de piloto, la mitad se remonta y vuelve a entrar deslizándose
      key={driver?.number ?? 'empty'}
      style={{
        ...colorStyle(color),
        clipPath: isLeft
          ? 'polygon(0 0, 100% 0, 88% 100%, 0 100%)'
          : 'polygon(12% 0, 100% 0, 100% 100%, 0 100%)',
        background: `linear-gradient(${isLeft ? '110deg' : '250deg'}, color-mix(in srgb, var(--team) 38%, #0B0E14), transparent 85%)`,
      }}
      className={clsx(
        'absolute inset-y-0 flex w-[56%] flex-col justify-center p-6 sm:p-10',
        isLeft
          ? 'left-0 items-start text-left md:items-end md:pl-10 md:pr-[12%] md:text-right'
          : 'right-0 items-end text-right md:items-start md:pl-[12%] md:pr-10 md:text-left',
      )}
      initial={reduceMotion ? false : { opacity: 0, x: isLeft ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Dorsal gigante de contorno: en móvil se asoma por el borde; desde md queda dentro, en el extremo exterior */}
      <span
        aria-hidden="true"
        className={clsx(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 select-none font-display text-[11rem] font-black italic leading-none text-transparent sm:text-[14rem] md:text-[16rem]',
          isLeft ? '-left-2 md:left-[3%]' : '-right-2 md:right-[3%]',
        )}
        style={{ WebkitTextStroke: '2px color-mix(in srgb, var(--team) 55%, transparent)' }}
      >
        {driver ? driver.number : '?'}
      </span>

      <div
        className={clsx(
          'relative flex flex-col gap-1',
          isLeft ? 'items-start md:items-end' : 'items-end md:items-start',
        )}
      >
        {driver ? (
          <>
            <span className="text-[10px] uppercase tracking-widest text-muted">
              Piloto {isLeft ? 'A' : 'B'}
            </span>
            <span className="font-display text-6xl font-black uppercase italic leading-none sm:text-8xl">
              {driver.acronym}
            </span>
            <span className="text-sm font-bold">{driver.fullName}</span>
            <span className="text-xs uppercase tracking-widest text-team">
              {driver.teamName ?? 'Escudería desconocida'}
            </span>
            <div className="mt-3">
              <LapChip lap={lap} fastest={fastest} />
            </div>
          </>
        ) : (
          <span className="font-display text-3xl font-extrabold uppercase italic text-white/30 sm:text-5xl">
            Elige el piloto {isLeft ? 'A' : 'B'}
          </span>
        )}
      </div>
    </motion.div>
  )
}

interface VersusBannerProps {
  driverA: Driver | null
  driverB: Driver | null
  lapA: LapState
  lapB: LapState
}

export function VersusBanner({ driverA, driverB, lapA, lapB }: VersusBannerProps) {
  // Diferencia solo cuando ambas vueltas existen. Positiva → A fue más rápido
  const diff = lapA && lapB ? lapB.durationSec - lapA.durationSec : null
  const faster = diff === null || diff === 0 ? null : diff > 0 ? driverA : driverB

  return (
    <section aria-label="Comparación de pilotos">
      <div className="relative h-80 overflow-hidden rounded-3xl border border-white/10 bg-surface sm:h-96">
        <VersusSide side="left" driver={driverA} lap={lapA} fastest={diff !== null && diff > 0} />
        <VersusSide side="right" driver={driverB} lap={lapB} fastest={diff !== null && diff < 0} />

        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 z-10 flex size-16 -translate-x-1/2 -translate-y-1/2 -skew-x-12 items-center justify-center border border-white/20 bg-base sm:size-20"
        >
          <span className="skew-x-12 font-display text-3xl font-black italic sm:text-4xl">VS</span>
        </div>
      </div>

      {faster && diff !== null && (
        <p className="mt-3 text-center text-xs text-muted">
          <span className="font-bold text-timing-purple">{faster.acronym}</span> fue{' '}
          {Math.abs(diff).toFixed(3)} s más rápido en su vuelta más rápida de la carrera.
        </p>
      )}
    </section>
  )
}