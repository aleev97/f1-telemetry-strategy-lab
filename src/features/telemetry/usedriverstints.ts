import { useCallback } from 'react'
import { useAsync } from '@/hooks/useasync'
import { getDriverStints } from '@/lib/api/openf1'
import type { Stint } from '@/types/f1'

export function useDriverStints(sessionKey: number | null, driverNumber: number | null) {
  const fetcher = useCallback(
    (signal: AbortSignal): Promise<Stint[]> =>
      sessionKey !== null && driverNumber !== null
        ? getDriverStints(sessionKey, driverNumber, signal)
        : Promise.resolve([]),
    [sessionKey, driverNumber],
  )
  return useAsync(fetcher)
}