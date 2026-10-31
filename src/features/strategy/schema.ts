import { z } from 'zod'

export const DRY_COMPOUNDS = ['SOFT', 'MEDIUM', 'HARD'] as const
export type DryCompound = (typeof DRY_COMPOUNDS)[number]

export const MAX_STINTS = 4

const required = 'Ingresa un número'

/**
 * Reglas del plan de paradas que involucran varios campos.
 * Función pura: la usa el schema (validación) y el panel de estado (feedback en vivo).
 */
export function stintPlanIssues(
  raceLaps: number,
  stints: { compound: DryCompound; laps: number }[],
): string[] {
  const issues: string[] = []

  const total = stints.reduce((sum, s) => sum + s.laps, 0)
  if (total !== raceLaps) {
    issues.push(`Los stints suman ${total} vueltas y la carrera tiene ${raceLaps}.`)
  }

  if (new Set(stints.map((s) => s.compound)).size < 2) {
    issues.push('Debes usar al menos dos compuestos distintos (regla de carrera en seco).')
  }

  return issues
}

const tyreParams = z.object({
  offsetSec: z.number({ error: required }).min(-3, 'Entre -3 y 3 s').max(3, 'Entre -3 y 3 s'),
  degSec: z.number({ error: required }).min(0, 'No puede ser negativa').max(1, 'Máximo 1 s por vuelta'),
})

const stintSchema = z.object({
  compound: z.enum(DRY_COMPOUNDS),
  laps: z.number({ error: required }).int('Debe ser entero').min(1, 'Mínimo 1 vuelta'),
})

export const strategySchema = z
  .object({
    raceLaps: z
      .number({ error: required })
      .int('Debe ser un número entero')
      .min(10, 'Mínimo 10 vueltas')
      .max(80, 'Máximo 80 vueltas'),
    baseLapSec: z.number({ error: required }).min(60, 'Mínimo 60 s').max(150, 'Máximo 150 s'),
    pitLossSec: z.number({ error: required }).min(10, 'Mínimo 10 s').max(40, 'Máximo 40 s'),
    tyres: z.object({ SOFT: tyreParams, MEDIUM: tyreParams, HARD: tyreParams }),
    stints: z.array(stintSchema).min(1).max(MAX_STINTS),
  })
  .superRefine((data, ctx) => {
    for (const message of stintPlanIssues(data.raceLaps, data.stints)) {
      ctx.addIssue({ code: 'custom', path: ['stints'], message })
    }
  })

export type StrategyFormValues = z.infer<typeof strategySchema>

/** Valores iniciales: supuestos razonables y editables, no datos oficiales */
export const DEFAULT_VALUES: StrategyFormValues = {
  raceLaps: 57,
  baseLapSec: 90,
  pitLossSec: 22,
  tyres: {
    SOFT: { offsetSec: -1.0, degSec: 0.15 },
    MEDIUM: { offsetSec: -0.5, degSec: 0.08 },
    HARD: { offsetSec: 0, degSec: 0.04 },
  },
  stints: [
    { compound: 'MEDIUM', laps: 25 },
    { compound: 'HARD', laps: 32 },
  ],
}