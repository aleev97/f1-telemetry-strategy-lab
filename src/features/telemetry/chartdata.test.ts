import { describe, expect, it } from 'vitest'
import type { LapTelemetry } from '@/types/f1'
import { buildChartRows, formatLapTime } from './chardata'

/** Vuelta sintética: velocidad constante, una muestra cada 0,25 s */
function makeLap(durationSec: number, speed: number): LapTelemetry {
  const samples: LapTelemetry['samples'] = []
  for (let t = 0; t <= durationSec; t += 0.25) samples.push({ t, speed })
  return { driverNumber: 1, lapNumber: 1, durationSec, samples }
}

describe('formatLapTime', () => {
  it('formatea minutos, segundos y milésimas', () => {
    expect(formatLapTime(81.456)).toBe('1:21.456')
    expect(formatLapTime(5.5)).toBe('0:05.500')
  })
})

describe('buildChartRows', () => {
  it('modo tiempo: remuestrea a una rejilla común de 301 puntos', () => {
    const rows = buildChartRows(makeLap(10, 180), makeLap(10, 200), 'time')
    expect(rows).toHaveLength(301)
    expect(rows[0].x).toBe(0)
    expect(rows[rows.length - 1].x).toBe(10)
    expect(rows.every((r) => r.a === 180 && r.b === 200)).toBe(true)
  })

  it('modo tiempo: la serie más corta queda en null donde termina', () => {
    const rows = buildChartRows(makeLap(10, 180), makeLap(8, 200), 'time')

    const at4 = rows.find((r) => r.x === 4)
    expect(at4?.a).toBe(180)
    expect(at4?.b).toBe(200)

    const at9 = rows.find((r) => r.x === 9)
    expect(at9?.a).toBe(180)
    expect(at9?.b).toBeNull()
  })

  it('modo distancia: ambas vueltas se alinean de 0 a 100 %', () => {
    const rows = buildChartRows(makeLap(10, 180), makeLap(8, 200), 'distance')
    expect(rows[0].x).toBe(0)
    expect(rows[rows.length - 1].x).toBe(100)
    expect(rows.every((r) => r.a === 180 && r.b === 200)).toBe(true)
  })
})