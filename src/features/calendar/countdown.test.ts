import { describe, expect, it } from 'vitest'
import { makeRace } from '@/test/factories'
import { getNextRace, splitDuration } from './countdown'

describe('splitDuration', () => {
  it('desglosa milisegundos en días, horas, minutos y segundos', () => {
    // 1 día + 1 hora + 1 minuto + 1 segundo
    expect(splitDuration(90_061_000)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 })
  })

  it('nunca devuelve valores negativos', () => {
    expect(splitDuration(-5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  })
})

describe('getNextRace', () => {
  const NOW = new Date('2026-06-01T12:00:00Z').getTime()
  const races = [
    makeRace(1, { startsAt: '2026-05-24T18:00:00Z' }),
    makeRace(2, { startsAt: '2026-06-07T13:00:00Z' }),
    makeRace(3, { startsAt: '2026-06-14T13:00:00Z' }),
  ]

  it('devuelve la primera carrera que aún no empezó', () => {
    expect(getNextRace(races, NOW)?.round).toBe(2)
  })

  it('devuelve null cuando la temporada terminó', () => {
    expect(getNextRace(races, new Date('2026-12-31T00:00:00Z').getTime())).toBeNull()
  })
})