import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { OdometerNumber } from '@/components/ui/odometernumber'
import { useNow } from '@/hooks/usenow'
import type { Race } from '@/types/f1'
import { getNextRace, splitDuration } from './countdown'

export function NextRaceCountdown({ races }: { races: Race[] }) {
  const now = useNow(1000)
  const next = getNextRace(races, now)

  if (!next) {
    return (
      <Card className="mb-8">
        <Badge>Temporada finalizada</Badge>
        <p className="mt-3 text-sm text-muted">No quedan Grandes Premios por disputar.</p>
      </Card>
    )
  }

  const { days, hours, minutes, seconds } = splitDuration(
    new Date(next.startsAt).getTime() - now,
  )

  const units = [
    { label: 'Días', value: days },
    { label: 'Horas', value: hours },
    { label: 'Min', value: minutes },
    { label: 'Seg', value: seconds },
  ]

  return (
    <Card glow className="mb-8">
      <Badge>Próximo GP · R{String(next.round).padStart(2, '0')}</Badge>
      <h2 className="mt-3 text-2xl font-bold">{next.name}</h2>
      <p className="mt-1 text-xs text-muted">
        {next.circuitName} · {next.locality}, {next.country}
      </p>

      <div
        role="timer"
        aria-label={`Faltan ${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos`}
        className="mt-6 flex gap-6 text-4xl font-bold text-team sm:gap-10 sm:text-6xl"
      >
        {units.map((u) => (
          <div key={u.label} className="flex flex-col items-start gap-2">
            <OdometerNumber value={u.value} />
            <span className="text-[10px] font-normal uppercase tracking-widest text-muted">
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}