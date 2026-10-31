import { TYRES } from '@/lib/tyres'
import type { Stint } from '@/types/f1'

/** Vueltas en las que el piloto entró a boxes: el final de cada stint salvo el último */
export function pitLaps(stints: Stint[]): number[] {
  return stints.slice(0, -1).map((s) => s.lapEnd)
}

/** Total de vueltas de la carrera, según el stint que llega más lejos */
export function raceLaps(...lists: Stint[][]): number {
  return Math.max(0, ...lists.flat().map((s) => s.lapEnd))
}

/** "M → H → M" */
export function compoundSequence(stints: Stint[]): string {
  return stints.map((s) => TYRES[s.compound].letter).join(' → ')
}