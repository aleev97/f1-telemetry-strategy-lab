import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded border border-team/40 bg-team/10 px-2 py-0.5 text-xs uppercase tracking-widest text-team',
        className,
      )}
      {...props}
    />
  )
}