import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import clsx from 'clsx'
import type { RaceStatus } from './filters'

const OPTIONS: { value: RaceStatus; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'upcoming', label: 'Próximas' },
  { value: 'completed', label: 'Finalizadas' },
]

interface CalendarFiltersProps {
  q: string
  status: RaceStatus
  shown: number
  total: number
  hasFilters: boolean
  onQueryChange: (value: string) => void
  onStatusChange: (value: RaceStatus) => void
  onReset: () => void
}

export function CalendarFilters({
  q,
  status,
  shown,
  total,
  hasFilters,
  onQueryChange,
  onStatusChange,
  onReset,
}: CalendarFiltersProps) {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar por país o circuito</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar por país o circuito…"
            className="w-full rounded-lg border border-white/10 bg-surface py-2.5 pl-10 pr-3 text-sm placeholder:text-muted focus:border-team focus:outline-none"
          />
        </label>

        <div className="inline-flex rounded-lg border border-white/10 bg-surface p-1">
          {OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onStatusChange(value)}
              aria-pressed={status === value}
              className={clsx(
                'relative px-3 py-1.5 text-xs uppercase tracking-widest transition-colors',
                status === value ? 'text-white' : 'text-muted hover:text-white',
              )}
            >
              {status === value && (
                <motion.span
                  layoutId="status-pill"
                  className="absolute inset-0 rounded-md border border-team/40 bg-team/20"
                />
              )}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted">
        <p aria-live="polite">
          {shown} de {total} Grandes Premios
        </p>
        {hasFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 uppercase tracking-widest transition-colors hover:text-white"
          >
            <X className="size-3.5" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}