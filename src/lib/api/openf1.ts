import { z } from 'zod'
import { OPENF1_BASE_URL } from './config'
import { ApiError, fetchJson } from './https'
import type { Driver, Lap, LapTelemetry, RaceSession, Stint } from '@/types/f1'
import { toCompound } from '@/lib/tyres'
const sessionSchema = z.object({
  session_key: z.number(),
  session_name: z.string(),
  date_start: z.string(),
  country_name: z.string(),
  circuit_short_name: z.string(),
})

const driverSchema = z.object({
  driver_number: z.number(),
  full_name: z.string(),
  name_acronym: z.string(),
  team_name: z.string().nullish(),
  team_colour: z.string().nullish(),
})

/** OpenF1 puede responder 404 cuando un filtro no tiene resultados: lo tratamos como lista vacía */
async function fetchList<T>(
  path: string,
  itemSchema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<T[]> {
  try {
    return await fetchJson(`${OPENF1_BASE_URL}/${path}`, z.array(itemSchema), signal)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return []
    throw err
  }
}

export async function getRaceSessions(
  year: number,
  signal?: AbortSignal,
): Promise<RaceSession[]> {
  const items = await fetchList(
    `sessions?year=${year}&session_name=Race`,
    sessionSchema,
    signal,
  )
  return items.map((s) => ({
    sessionKey: s.session_key,
    name: s.session_name,
    startsAt: s.date_start,
    country: s.country_name,
    circuit: s.circuit_short_name,
  }))
}

export async function getSessionDrivers(
  sessionKey: number,
  signal?: AbortSignal,
): Promise<Driver[]> {
  const items = await fetchList(`drivers?session_key=${sessionKey}`, driverSchema, signal)
  return items.map((d) => ({
    number: d.driver_number,
    fullName: d.full_name,
    acronym: d.name_acronym,
    teamName: d.team_name ?? null,
    teamColor: d.team_colour ? `#${d.team_colour}` : null,
  }))
}

const lapSchema = z.object({
  lap_number: z.number(),
  lap_duration: z.number().nullish(),
  date_start: z.string().nullish(),
  is_pit_out_lap: z.boolean().nullish(),
})

const carDataSchema = z.object({
  date: z.string(),
  speed: z.number(),
})

/** La vuelta más rápida válida: con tiempo registrado y que no sea de salida de boxes */
export async function getFastestLap(
  sessionKey: number,
  driverNumber: number,
  signal?: AbortSignal,
): Promise<Lap | null> {
  const items = await fetchList(
    `laps?session_key=${sessionKey}&driver_number=${driverNumber}`,
    lapSchema,
    signal,
  )

  let best: Lap | null = null
  for (const l of items) {
    if (!l.lap_duration || !l.date_start || l.is_pit_out_lap) continue
    if (!best || l.lap_duration < best.durationSec) {
      best = { number: l.lap_number, durationSec: l.lap_duration, startsAt: l.date_start }
    }
  }
  return best
}

/** Velocidad de la vuelta más rápida de un piloto, o null si no hay una vuelta válida con datos */
export async function getFastestLapTelemetry(
  sessionKey: number,
  driverNumber: number,
  signal?: AbortSignal,
): Promise<LapTelemetry | null> {
  const lap = await getFastestLap(sessionKey, driverNumber, signal)
  if (!lap) return null

  const start = new Date(lap.startsAt)
  const end = new Date(start.getTime() + lap.durationSec * 1000)

  const rows = await fetchList(
    `car_data?session_key=${sessionKey}&driver_number=${driverNumber}` +
      `&date>=${start.toISOString()}&date<${end.toISOString()}`,
    carDataSchema,
    signal,
  )

  const samples = rows
    .map((r) => ({ t: (new Date(r.date).getTime() - start.getTime()) / 1000, speed: r.speed }))
    .filter((s) => s.t >= 0)
    .sort((p, q) => p.t - q.t)

  if (samples.length < 20) return null

  return { driverNumber, lapNumber: lap.number, durationSec: lap.durationSec, samples }
}

const stintSchema = z.object({
  stint_number: z.number(),
  lap_start: z.number().nullish(),
  lap_end: z.number().nullish(),
  compound: z.string().nullish(),
  tyre_age_at_start: z.number().nullish(),
})

export async function getDriverStints(
  sessionKey: number,
  driverNumber: number,
  signal?: AbortSignal,
): Promise<Stint[]> {
  const items = await fetchList(
    `stints?session_key=${sessionKey}&driver_number=${driverNumber}`,
    stintSchema,
    signal,
  )

  const stints: Stint[] = []
  for (const s of items) {
    // Un stint sin vueltas definidas no se puede dibujar
    if (s.lap_start == null || s.lap_end == null) continue
    stints.push({
      number: s.stint_number,
      compound: toCompound(s.compound),
      lapStart: s.lap_start,
      lapEnd: s.lap_end,
      ageAtStart: s.tyre_age_at_start ?? null,
    })
  }
  return stints.sort((a, b) => a.number - b.number)
}