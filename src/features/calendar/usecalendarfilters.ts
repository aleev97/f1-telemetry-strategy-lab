import { useSearchParams } from 'react-router'
import { statusSchema, type RaceStatus } from './filters'

export function useCalendarFilters() {
  const [params, setParams] = useSearchParams()

  const q = params.get('q') ?? ''
  const status = statusSchema.parse(params.get('status'))

  function update(
    key: 'q' | 'status',
    value: string,
    options: { replace: boolean; flushSync?: boolean },
  ) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev) // copia: nunca mutes `prev`
        if (value) next.set(key, value)
        else next.delete(key) // los valores por defecto no ensucian la URL
        return next
      },
      options,
    )
  }

  return {
    q,
    status,
    // Al escribir: replace (sin llenar el historial) y flushSync (el input responde al instante)
    setQuery: (value: string) => update('q', value, { replace: true, flushSync: true }),
    // Al elegir un filtro: push, para que "Atrás" lo deshaga
    setStatus: (value: RaceStatus) =>
      update('status', value === 'all' ? '' : value, { replace: false }),
    reset: () => setParams({}, { replace: true }),
  }
}