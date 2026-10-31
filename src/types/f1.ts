export interface WeekendSession {
  name: string
  /** ISO 8601 en UTC */
  startsAt: string
}

export interface Race {
  round: number
  name: string
  circuitId: string
  circuitName: string
  locality: string
  country: string
  /** ISO 8601 en UTC, listo para new Date(...) y la cuenta regresiva */
  startsAt: string
  /** Sesiones del fin de semana en orden cronológico, incluida la carrera */
  sessions: WeekendSession[]
}

export interface PodiumEntry {
  position: number
  firstName: string
  lastName: string
  team: string
  /** Tiempo total (ganador) o diferencia (resto); null si no figura */
  time: string | null
}

export interface LastEdition {
  season: number
  raceName: string
  podium: PodiumEntry[]
}

export interface RaceSession {
  sessionKey: number
  name: string
  startsAt: string
  country: string
  circuit: string
}

export interface Driver {
  number: number
  fullName: string
  acronym: string
  teamName: string | null
  /** Hex con '#', o null si la API no lo informa */
  teamColor: string | null
}

export interface Lap {
  number: number
  durationSec: number
  /** ISO 8601 */
  startsAt: string
}

export interface SpeedSample {
  /** Segundos desde el inicio de la vuelta */
  t: number
  /** km/h */
  speed: number
}

export interface LapTelemetry {
  driverNumber: number
  lapNumber: number
  durationSec: number
  samples: SpeedSample[]
}

export type TyreCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | 'UNKNOWN'

export interface Stint {
  number: number
  compound: TyreCompound
  lapStart: number
  lapEnd: number
  /** Vueltas que ya tenía el juego de neumáticos al montarse (0 si son nuevos) */
  ageAtStart: number | null
}