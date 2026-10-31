import type { ZodType } from 'zod'

export type ApiErrorKind = 'network' | 'http' | 'shape'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

export async function fetchJson<T>(
  url: string,
  schema: ZodType<T>,
  signal?: AbortSignal,
): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, { signal })
  } catch (err) {
    // Una cancelación voluntaria NO es un error de red: se propaga tal cual
    if (signal?.aborted) throw err
    throw new ApiError('network', 'No se pudo conectar con el servidor')
  }

  if (!res.ok) {
    const message =
      res.status === 429
        ? 'Demasiadas solicitudes, espera unos segundos'
        : `Error ${res.status} al consultar la API`
    throw new ApiError('http', message, res.status)
  }

  const json: unknown = await res.json()
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    throw new ApiError('shape', 'La API devolvió datos con un formato inesperado')
  }
  return parsed.data
}