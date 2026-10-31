import { describe, expect, it } from 'vitest'
import {
  MIN_ALT_STINT,
  bestStrategies,
  degradationLoss,
  formatDelta,
  formatRaceTime,
  lapByLap,
  pitWindows,
  raceTime,
  stintTime,
  type EngineParams,
} from './engine'
import { DEFAULT_VALUES, DRY_COMPOUNDS } from './schema'

// Con los valores por defecto, los resultados esperados están calculados a mano
const { stints, ...params } = DEFAULT_VALUES

describe('stintTime', () => {
  it('suma la serie aritmética de la degradación', () => {
    // 25 × (90 − 0.5) + 0.08 × (25 × 24 / 2) = 2237.5 + 24
    expect(stintTime(params, 'MEDIUM', 25)).toBeCloseTo(2261.5, 6)
    // 32 × 90 + 0.04 × (32 × 31 / 2) = 2880 + 19.84
    expect(stintTime(params, 'HARD', 32)).toBeCloseTo(2899.84, 6)
  })
})

describe('raceTime', () => {
  it('suma los stints y el tiempo perdido en boxes', () => {
    // 2261.5 + 2899.84 + 22 s de una parada
    expect(raceTime(params, stints)).toBeCloseTo(5183.34, 6)
  })
})

describe('degradationLoss', () => {
  it('suma la pérdida por desgaste de todos los stints', () => {
    expect(degradationLoss(params, stints)).toBeCloseTo(24 + 19.84, 6)
  })
})

describe('lapByLap', () => {
  const laps = lapByLap(params, stints)

  it('genera una entrada por cada vuelta de la carrera', () => {
    expect(laps).toHaveLength(57)
  })

  it('la degradación crece dentro del stint y se reinicia al cambiar de neumáticos', () => {
    expect(laps[0].timeSec).toBeCloseTo(89.5, 6) // vuelta 1
    expect(laps[24].timeSec).toBeCloseTo(91.42, 6) // vuelta 25: edad 24
    expect(laps[25].timeSec).toBeCloseTo(90, 6) // vuelta 26: duros nuevos
    expect(laps[56].timeSec).toBeCloseTo(91.24, 6) // vuelta 57: edad 31
  })

  it('numera los stints desde 0', () => {
    expect(laps[24].stintIndex).toBe(0)
    expect(laps[25].stintIndex).toBe(1)
  })
})

describe('pitWindows', () => {
  const windows = pitWindows(params, stints)

  it('devuelve una ventana por cada parada', () => {
    expect(windows).toHaveLength(1)
  })

  it('encuentra la vuelta óptima y la ventana de 1 s', () => {
    const [first] = windows
    expect(first.currentLap).toBe(25)
    expect(first.optimalLap).toBe(23)
    expect(first.fromLap).toBe(20)
    expect(first.toLap).toBe(27)
    expect(first.costVsOptimalSec).toBeCloseTo(0.16, 6)
  })
})

describe('bestStrategies', () => {
  const candidates = bestStrategies(params)

  it('devuelve estrategias válidas con 1, 2 y 3 paradas', () => {
    expect(candidates.map((c) => c.stints.length - 1)).toEqual([1, 2, 3])

    for (const c of candidates) {
      expect(c.stints.reduce((sum, s) => sum + s.laps, 0)).toBe(params.raceLaps)
      expect(new Set(c.stints.map((s) => s.compound)).size).toBeGreaterThanOrEqual(2)
      for (const s of c.stints) expect(s.laps).toBeGreaterThanOrEqual(MIN_ALT_STINT)
      // El tiempo que calcula la búsqueda coincide con el cálculo directo
      expect(c.totalSec).toBeCloseTo(raceTime(params, c.stints), 6)
    }
  })

  it('coincide con una búsqueda exhaustiva de 1 parada (la poda no pierde soluciones)', () => {
    const small: EngineParams = { ...params, raceLaps: 20 }

    let best = Infinity
    for (const a of DRY_COMPOUNDS) {
      for (const b of DRY_COMPOUNDS) {
        if (a === b) continue
        for (let first = MIN_ALT_STINT; first <= small.raceLaps - MIN_ALT_STINT; first++) {
          const total = raceTime(small, [
            { compound: a, laps: first },
            { compound: b, laps: small.raceLaps - first },
          ])
          best = Math.min(best, total)
        }
      }
    }

    const oneStop = bestStrategies(small).find((c) => c.stints.length === 2)
    expect(oneStop?.totalSec).toBeCloseTo(best, 6)
  })

  it('omite las paradas que no caben en una carrera corta', () => {
    const tiny: EngineParams = { ...params, raceLaps: 12 }
    expect(bestStrategies(tiny).map((c) => c.stints.length - 1)).toEqual([1])
  })
})

describe('formato', () => {
  it('formatRaceTime', () => {
    expect(formatRaceTime(5183.34)).toBe('1:26:23.340')
  })

  it('formatDelta', () => {
    expect(formatDelta(0.16)).toBe('+0.160 s')
    expect(formatDelta(-1.5)).toBe('−1.500 s')
  })
})