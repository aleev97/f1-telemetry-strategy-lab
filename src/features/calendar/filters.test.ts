import { describe, expect, it } from 'vitest'
import { makeRace } from '@/test/factories'
import { filterRaces, statusSchema } from './filters'

const NOW = new Date('2026-06-01T12:00:00Z').getTime()

const races = [
  makeRace(1, { country: 'Canada', locality: 'Montréal', startsAt: '2026-05-24T18:00:00Z' }),
  makeRace(2, { country: 'Monaco', locality: 'Monte-Carlo', startsAt: '2026-06-07T13:00:00Z' }),
  makeRace(3, { country: 'Spain', locality: 'Barcelona', startsAt: '2026-06-14T13:00:00Z' }),
]

const rounds = (list: ReturnType<typeof filterRaces>) => list.map((r) => r.round)

describe('filterRaces', () => {
  it('sin filtros devuelve todas las carreras', () => {
    expect(rounds(filterRaces(races, { q: '', status: 'all' }, NOW))).toEqual([1, 2, 3])
  })

  it('filtra por estado', () => {
    expect(rounds(filterRaces(races, { q: '', status: 'upcoming' }, NOW))).toEqual([2, 3])
    expect(rounds(filterRaces(races, { q: '', status: 'completed' }, NOW))).toEqual([1])
  })

  it('la búsqueda ignora mayúsculas y acentos', () => {
    expect(rounds(filterRaces(races, { q: 'MONTREAL', status: 'all' }, NOW))).toEqual([1])
    expect(rounds(filterRaces(races, { q: 'monaco', status: 'all' }, NOW))).toEqual([2])
  })

  it('busca también en el nombre del circuito y de la localidad', () => {
    expect(rounds(filterRaces(races, { q: 'barcelona', status: 'all' }, NOW))).toEqual([3])
    expect(rounds(filterRaces(races, { q: 'circuito 2', status: 'all' }, NOW))).toEqual([2])
  })

  it('combina búsqueda y estado', () => {
    expect(rounds(filterRaces(races, { q: 'canada', status: 'upcoming' }, NOW))).toEqual([])
  })
})

describe('statusSchema', () => {
  it('acepta los estados válidos', () => {
    expect(statusSchema.parse('upcoming')).toBe('upcoming')
  })

  it('cualquier valor inválido de la URL cae en "all"', () => {
    expect(statusSchema.parse('banana')).toBe('all')
    expect(statusSchema.parse(null)).toBe('all')
  })
})