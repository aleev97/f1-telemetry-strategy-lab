import { z } from 'zod'
import type { LastEdition, Race, WeekendSession } from '@/types/f1'
import { JOLPICA_BASE_URL } from './config'
import { fetchJson } from './https'

// Cada sesión del fin de semana es opcional: depende del formato (normal o sprint)
const sessionTimeSchema = z
  .object({ date: z.string(), time: z.string().optional() })
  .optional()

const raceSchema = z.object({
  round: z.string(),
  raceName: z.string(),
  date: z.string(),
  time: z.string().optional(),
  Circuit: z.object({
    circuitId: z.string(),
    circuitName: z.string(),
    Location: z.object({
      locality: z.string(),
      country: z.string(),
    }),
  }),
  FirstPractice: sessionTimeSchema,
  SecondPractice: sessionTimeSchema,
  ThirdPractice: sessionTimeSchema,
  SprintQualifying: sessionTimeSchema,
  Sprint: sessionTimeSchema,
  Qualifying: sessionTimeSchema,
})

const calendarSchema = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(raceSchema),
    }),
  }),
})

type RawRace = z.infer<typeof raceSchema>

const SESSION_FIELDS = [
  ['FirstPractice', 'Libre 1'],
  ['SecondPractice', 'Libre 2'],
  ['ThirdPractice', 'Libre 3'],
  ['SprintQualifying', 'Clasificación sprint'],
  ['Sprint', 'Sprint'],
  ['Qualifying', 'Clasificación'],
] as const

const toIso = (date: string, time?: string) => `${date}T${time ?? '00:00:00Z'}`

function buildSessions(r: RawRace): WeekendSession[] {
  const sessions: WeekendSession[] = []

  for (const [field, name] of SESSION_FIELDS) {
    const s = r[field]
    if (s) sessions.push({ name, startsAt: toIso(s.date, s.time) })
  }
  sessions.push({ name: 'Carrera', startsAt: toIso(r.date, r.time) })

  // Fechas ISO en UTC con el mismo formato: ordenar como texto es ordenar en el tiempo
  return sessions.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

// Caché de calendarios YA resueltos. No se cachean promesas en vuelo ni errores
const calendarCache = new Map<number, Race[]>()

/** Devuelve el calendario de una temporada. El array es compartido: no lo mutes */
export async function getSeasonCalendar(
  season: number,
  signal?: AbortSignal,
): Promise<Race[]> {
  const cached = calendarCache.get(season)
  if (cached) return cached

  const data = await fetchJson(
    `${JOLPICA_BASE_URL}/${season}/races.json?limit=100`,
    calendarSchema,
    signal,
  )

  const races: Race[] = data.MRData.RaceTable.Races.map((r) => ({
    round: Number(r.round),
    name: r.raceName,
    circuitId: r.Circuit.circuitId,
    circuitName: r.Circuit.circuitName,
    locality: r.Circuit.Location.locality,
    country: r.Circuit.Location.country,
    startsAt: toIso(r.date, r.time),
    sessions: buildSessions(r),
  }))

  calendarCache.set(season, races)
  return races
}

// ---------- Podio de una edición anterior ----------

const resultsSchema = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(
        z.object({
          Results: z.array(
            z.object({
              position: z.string(),
              Driver: z.object({ givenName: z.string(), familyName: z.string() }),
              Constructor: z.object({ name: z.string() }),
              Time: z.object({ time: z.string() }).optional(),
            }),
          ),
        }),
      ),
    }),
  }),
})

/**
 * Podio del circuito en una temporada dada. Devuelve null si ese circuito
 * no estuvo en el calendario de esa temporada o aún no hay resultados.
 */
export async function getLastEdition(
  circuitId: string,
  season: number,
  signal?: AbortSignal,
): Promise<LastEdition | null> {
  const calendar = await getSeasonCalendar(season, signal)
  const race = calendar.find((r) => r.circuitId === circuitId)
  if (!race) return null

  const data = await fetchJson(
    `${JOLPICA_BASE_URL}/${season}/${race.round}/results.json?limit=3`,
    resultsSchema,
    signal,
  )

  const results = data.MRData.RaceTable.Races[0]?.Results ?? []
  if (results.length === 0) return null

  return {
    season,
    raceName: race.name,
    podium: results.map((r) => ({
      position: Number(r.position),
      firstName: r.Driver.givenName,
      lastName: r.Driver.familyName,
      team: r.Constructor.name,
      time: r.Time?.time ?? null,
    })),
  }
}