import { useCallback, useEffect, useState } from 'react'

type Fetcher<T> = (signal: AbortSignal) => Promise<T>

type Settled<T> =
  | { fetcher: Fetcher<T>; attempt: number; ok: true; data: T }
  | { fetcher: Fetcher<T>; attempt: number; ok: false; error: Error }

export type AsyncResult<T> =
  | { status: 'loading'; reload: () => void }
  | { status: 'error'; error: Error; reload: () => void }
  | { status: 'success'; data: T; reload: () => void }

export function useAsync<T>(fetcher: Fetcher<T>): AsyncResult<T> {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetcher(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setSettled({ fetcher, attempt, ok: true, data })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const error = err instanceof Error ? err : new Error('Error desconocido')
        setSettled({ fetcher, attempt, ok: false, error })
      })

    return () => controller.abort()
  }, [fetcher, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  // Un resultado solo vale si corresponde a ESTE fetcher y a ESTE intento.
  // Si cambió el fetcher o pediste reintentar, estamos de nuevo en "loading".
  const current =
    settled && settled.fetcher === fetcher && settled.attempt === attempt ? settled : null

  if (!current) return { status: 'loading', reload }
  if (!current.ok) return { status: 'error', error: current.error, reload }
  return { status: 'success', data: current.data, reload }
}