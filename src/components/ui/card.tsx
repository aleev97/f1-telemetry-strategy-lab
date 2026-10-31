import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function Card({ glow = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-white/10 bg-surface p-5 transition-shadow duration-300',
        glow && 'hover:glow-team',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}