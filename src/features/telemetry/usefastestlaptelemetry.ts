import { useCallback } from 'react'
import { useAsync } from '@/hooks/useasync'
import { getFastestLapTelemetry } from '@/lib/api/openf1'
import type { LapTelemetry } from '@/types/f1'

/** Carga la vuelta más rápida de un piloto. Sin sesión o piloto, resuelve a null sin llamar a la API */
export function useFastestLapTelemetry(sessionKey: number | null, driverNumber: number | null) {
  const fetcher = useCallback(
    (signal: AbortSignal): Promise<LapTelemetry | null> =>
      sessionKey !== null && driverNumber !== null
        ? getFastestLapTelemetry(sessionKey, driverNumber, signal)
        : Promise.resolve(null),
    [sessionKey, driverNumber],
  )
  return useAsync(fetcher)
}