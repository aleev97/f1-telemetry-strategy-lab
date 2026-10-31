import type { TyreCompound } from '@/types/f1'

export const TYRES: Record<TyreCompound, { label: string; letter: string; color: string }> = {
  SOFT: { label: 'Blando', letter: 'S', color: '#FF3B3B' },
  MEDIUM: { label: 'Medio', letter: 'M', color: '#FFD60A' },
  HARD: { label: 'Duro', letter: 'H', color: '#F2F2F2' },
  INTERMEDIATE: { label: 'Intermedio', letter: 'I', color: '#34C759' },
  WET: { label: 'Mojado', letter: 'W', color: '#3B82F6' },
  UNKNOWN: { label: 'Desconocido', letter: '?', color: '#8B93A7' },
}

function isCompound(value: string): value is TyreCompound {
  return value in TYRES
}

/** Normaliza el texto libre de la API a un compuesto conocido */
export function toCompound(raw: string | null | undefined): TyreCompound {
  const value = raw?.toUpperCase()
  return value && isCompound(value) ? value : 'UNKNOWN'
}