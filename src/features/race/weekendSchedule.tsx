import clsx from 'clsx'
import { Card } from '@/components/ui/card'
import { useNow } from '@/hooks/usenow'
import type { WeekendSession } from '@/types/f1'

const dayFormat = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})
const timeFormat = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

export function WeekendSchedule({ sessions }: { sessions: WeekendSession[] }) {
  const now = useNow(60_000)
  const nextIndex = sessions.findIndex((s) => new Date(s.startsAt).getTime() > now)

  return (
    <Card>
      <h2 className="text-sm font-bold uppercase tracking-widest">Horario del fin de semana</h2>
      <p className="mt-1 text-xs text-muted">Horarios en tu zona horaria ({TIME_ZONE}).</p>

      <ol className="mt-6 space-y-2">
        {sessions.map((session, i) => {
          const date = new Date(session.startsAt)
          const isNext = i === nextIndex
          const isPast = nextIndex === -1 || i < nextIndex
          const isRace = session.name === 'Carrera'

          return (
            <li
              key={session.name}
              className={clsx(
                'grid grid-cols-[5rem_1fr_auto] items-center gap-3 rounded-lg border px-4 py-3 transition-opacity sm:grid-cols-[6rem_1fr_auto]',
                isRace ? 'border-team/40 bg-team/10' : 'border-white/5 bg-white/[0.02]',
                isPast && 'opacity-40',
              )}
            >
              <span className="text-xs uppercase tracking-widest text-muted">
                {dayFormat.format(date)}
              </span>
              <span className="font-display text-xl font-extrabold uppercase italic leading-tight">
                {session.name}
              </span>
              <span className="flex items-center gap-3">
                {isNext && (
                  <span className="relative flex size-2" aria-label="Próxima sesión">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-team opacity-75 motion-reduce:animate-none" />
                    <span className="relative inline-flex size-2 rounded-full bg-team" />
                  </span>
                )}
                <time dateTime={session.startsAt} className="text-lg font-bold tabular-nums">
                  {timeFormat.format(date)}
                </time>
              </span>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}