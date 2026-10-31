import data from '@/data/circuits.json'

export interface CircuitTraceData {
  path: string
  viewBox: string
}

const circuits: Record<string, CircuitTraceData> = data

/** Devuelve el trazado de un circuito, o null si no tenemos datos históricos */
export function getCircuitTrace(circuitId: string): CircuitTraceData | null {
  return circuits[circuitId] ?? null
}