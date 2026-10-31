import type { CSSProperties } from 'react'

export const TEAMS = {
  alpine:      { id: 'alpine',      name: 'Alpine',       color: '#0093CC', secondary: '#FF87BC' },
  astonmartin: { id: 'astonmartin', name: 'Aston Martin', color: '#229971', secondary: '#CEDC00' },
  audi:        { id: 'audi',        name: 'Audi',         color: '#F50537', secondary: '#C9CED6' },
  cadillac:    { id: 'cadillac',    name: 'Cadillac',     color: '#E5E7EB', secondary: '#D4AF37' },
  ferrari:     { id: 'ferrari',     name: 'Ferrari',      color: '#E8002D', secondary: '#FFFFFF' },
  haas:        { id: 'haas',        name: 'Haas',         color: '#B6BABD', secondary: '#E10600' },
  mclaren:     { id: 'mclaren',     name: 'McLaren',      color: '#FF8000', secondary: '#47C7FC' },
  mercedes:    { id: 'mercedes',    name: 'Mercedes',     color: '#27F4D2', secondary: '#9AA4AF' },
  racingbulls: { id: 'racingbulls', name: 'Racing Bulls', color: '#6692FF', secondary: '#E6ECFF' },
  redbull:     { id: 'redbull',     name: 'Red Bull',     color: '#3671C6', secondary: '#FF3355' },
  williams:    { id: 'williams',    name: 'Williams',     color: '#64C4FF', secondary: '#1B5FE0' },
} as const

export type TeamId = keyof typeof TEAMS

export const TEAM_IDS = Object.keys(TEAMS) as TeamId[]

/** Activa un tema (principal y secundario) en un contenedor. Sin secundario, usa el mismo color */
export function colorStyle(color: string, secondary: string = color): CSSProperties {
  return { ['--team' as string]: color, ['--team-2' as string]: secondary }
}

/** Activa el tema de una escudería conocida */
export function teamStyle(id: TeamId): CSSProperties {
  const { color, secondary } = TEAMS[id]
  return colorStyle(color, secondary)
}

const FALLBACK_COLOR = '#8B93A7'

/** Color real del piloto según OpenF1, con un gris neutro si la API no lo informa */
export function driverColor(driver: { teamColor: string | null }): string {
  return driver.teamColor ?? FALLBACK_COLOR
}