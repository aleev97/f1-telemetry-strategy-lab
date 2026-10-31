import type { ReactNode } from 'react'
import clsx from 'clsx'

type Led = 'ok' | 'warn' | 'idle'

const LED_STYLES: Record<Led, string> = {
  ok: 'bg-timing-green shadow-[0_0_8px_#00E676]',
  warn: 'bg-timing-yellow shadow-[0_0_8px_#FFD60A]',
  idle: 'bg-white/20',
}

interface PanelProps {
  title: string
  led?: Led
  /** Contenido opcional a la derecha de la barra de título */
  aside?: ReactNode
  className?: string
  children: ReactNode
}

export function Panel({ title, led = 'idle', aside, className, children }: PanelProps) {
  return (
    <section
      className={clsx(
        'relative overflow-hidden rounded-xl border border-white/10 bg-surface',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-3">
        <h2 className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em]">
          <span aria-hidden="true" className={clsx('size-2 rounded-full', LED_STYLES[led])} />
          {title}
        </h2>
        {aside}
      </header>

      <div className="p-5">{children}</div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 size-3 border-b border-l border-team/60"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 size-3 border-b border-r border-team/60"
      />
    </section>
  )
}