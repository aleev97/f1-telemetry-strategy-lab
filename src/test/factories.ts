import type { Race } from '@/types/f1'

export function makeRace(round: number, overrides: Partial<Race> = {}): Race {
  return {
    round,
    name: `Gran Premio ${round}`,
    circuitId: `circuit_${round}`,
    circuitName: `Circuito ${round}`,
    locality: 'Localidad',
    country: 'País',
    startsAt: '2026-07-01T13:00:00Z',
    sessions: [],
    ...overrides,
  }
}