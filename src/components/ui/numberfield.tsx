import type { ComponentProps } from 'react'
import clsx from 'clsx'

type NumberFieldProps = ComponentProps<'input'> & {
  label: string
  unit?: string
  error?: string
}

export function NumberField({ label, unit, error, className, id, ...props }: NumberFieldProps) {
  const inputId = id ?? props.name
  const errorId = `${inputId}-error`

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={clsx(
            'w-full rounded-lg border bg-surface py-2.5 pl-3 text-sm tabular-nums focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--team)_25%,transparent)]',
            unit ? 'pr-16' : 'pr-3',
            error ? 'border-red-400/60 focus:border-red-400' : 'border-white/10 focus:border-team',
            className,
          )}
          {...props}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
            {unit}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}