import { describe, expect, it } from 'vitest'
import { DEFAULT_VALUES, stintPlanIssues, strategySchema } from './schema'

describe('stintPlanIssues', () => {
  it('no reporta problemas en un plan válido', () => {
    expect(
      stintPlanIssues(57, [
        { compound: 'MEDIUM', laps: 25 },
        { compound: 'HARD', laps: 32 },
      ]),
    ).toEqual([])
  })

  it('detecta que los stints no suman las vueltas de la carrera', () => {
    const issues = stintPlanIssues(57, [
      { compound: 'MEDIUM', laps: 25 },
      { compound: 'HARD', laps: 30 },
    ])
    expect(issues).toHaveLength(1)
    expect(issues[0]).toContain('suman 55')
  })

  it('exige al menos dos compuestos distintos', () => {
    const issues = stintPlanIssues(50, [
      { compound: 'MEDIUM', laps: 25 },
      { compound: 'MEDIUM', laps: 25 },
    ])
    expect(issues.join(' ')).toContain('dos compuestos')
  })
})

describe('strategySchema', () => {
  it('acepta los valores por defecto', () => {
    expect(strategySchema.safeParse(DEFAULT_VALUES).success).toBe(true)
  })

  it('rechaza una carrera de menos de 10 vueltas', () => {
    expect(strategySchema.safeParse({ ...DEFAULT_VALUES, raceLaps: 5 }).success).toBe(false)
  })

  it('rechaza un plan que no suma las vueltas de la carrera', () => {
    expect(strategySchema.safeParse({ ...DEFAULT_VALUES, raceLaps: 60 }).success).toBe(false)
  })

  it('un campo vacío (NaN) da un mensaje en español', () => {
    const result = strategySchema.safeParse({ ...DEFAULT_VALUES, baseLapSec: Number.NaN })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].message).toBe('Ingresa un número')
  })
})