import { z } from 'zod'
import type { Race } from '@/types/f1'

export const STATUSES = ['all', 'upcoming', 'completed'] as const
export type RaceStatus = (typeof STATUSES)[number]

/** Lo que venga de la URL se valida: cualquier valor desconocido cae en 'all' */
export const statusSchema = z.enum(STATUSES).catch('all')

export interface CalendarFilters {
  q: string
  status: RaceStatus
}

/** Minúsculas y sin acentos, para que "Monaco" y "MÓNACO" coincidan */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export function filterRaces(races: Race[], { q, status }: CalendarFilters, now: number): Race[] {
  const needle = normalize(q)

  return races.filter((race) => {
    const isCompleted = new Date(race.startsAt).getTime() <= now
    if (status === 'upcoming' && isCompleted) return false
    if (status === 'completed' && !isCompleted) return false

    if (!needle) return true
    return [race.name, race.circuitName, race.locality, race.country].some((field) =>
      normalize(field).includes(needle),
    )
  })
}