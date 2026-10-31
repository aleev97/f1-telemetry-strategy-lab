import { motion, useReducedMotion } from 'framer-motion'
import clsx from 'clsx'

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function Digit({ digit }: { digit: number }) {
  const reduceMotion = useReducedMotion()

  return (
    <span className="relative inline-block h-[1em] w-[1ch] overflow-hidden leading-none">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false} // al montar, aparece directo en su valor (sin rodar desde 0)
        animate={{ y: `${-digit}em` }}
        transition={
          reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 26 }
        }
      >
        {DIGITS.map((d) => (
          <span key={d} className="block h-[1em] leading-none">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

interface OdometerNumberProps {
  value: number
  minDigits?: number
  className?: string
}

export function OdometerNumber({ value, minDigits = 2, className }: OdometerNumberProps) {
  const digits = String(Math.max(0, Math.trunc(value)))
    .padStart(minDigits, '0')
    .split('')
    .map(Number)

  return (
    <span className={clsx('inline-flex tabular-nums', className)} aria-hidden="true">
      {digits.map((d, i) => (
        // Clave contada desde la derecha: las unidades siempre son "la misma" columna
        <Digit key={digits.length - i} digit={d} />
      ))}
    </span>
  )
}