import { useSearchParams } from 'react-router'
import { z } from 'zod'

/** OpenF1 ofrece datos históricos desde 2023 */
export const MIN_YEAR = 2023
const CURRENT_YEAR = new Date().getFullYear()

export const AVAILABLE_YEARS = Array.from(
  { length: CURRENT_YEAR - MIN_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i,
)

// Lo que viene de la URL no es de fiar: cualquier valor inválido cae en un valor seguro
const yearSchema = z.coerce.number().int().min(MIN_YEAR).max(CURRENT_YEAR).catch(CURRENT_YEAR)
const idSchema = z.coerce.number().int().positive().nullable().catch(null)

export function useTelemetrySelection() {
  const [params, setParams] = useSearchParams()

  const year = yearSchema.parse(params.get('year'))
  const sessionKey = idSchema.parse(params.get('session'))
  const a = idSchema.parse(params.get('a'))
  const rawB = idSchema.parse(params.get('b'))
  // Un piloto no puede compararse consigo mismo, ni siquiera por URL manipulada
  const b = rawB !== null && rawB === a ? null : rawB

  function update(patch: Record<string, string | null>) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) next.delete(key)
        else next.set(key, value)
      }
      return next
    })
  }

  const orNull = (raw: string) => (raw === '' ? null : raw)

  return {
    year,
    sessionKey,
    a,
    b,
    // Cada cambio invalida lo que depende de él
    setYear: (value: number) => update({ year: String(value), session: null, a: null, b: null }),
    setSession: (raw: string) => update({ session: orNull(raw), a: null, b: null }),
    setDriverA: (raw: string) => update({ a: orNull(raw) }),
    setDriverB: (raw: string) => update({ b: orNull(raw) }),
  }
}