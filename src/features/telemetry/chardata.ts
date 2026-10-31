import type { LapTelemetry } from '@/types/f1'

export type XAxisMode = 'time' | 'distance'

export interface ChartRow {
  x: number
  a: number | null
  b: number | null
}

interface Point {
  x: number
  y: number
}

const STEPS = 300 // resolución de la rejilla común
const round = (value: number, digits = 1) => Number(value.toFixed(digits))

function toPoints(lap: LapTelemetry, mode: XAxisMode): Point[] {
  const { samples } = lap
  if (mode === 'time') return samples.map((s) => ({ x: s.t, y: s.speed }))

  // Distancia aproximada: integral de la velocidad (km/h → m/s) con la regla del trapecio
  const meters: number[] = [0]
  for (let i = 1; i < samples.length; i++) {
    const dt = samples[i].t - samples[i - 1].t
    const avgSpeed = (samples[i].speed + samples[i - 1].speed) / 2 / 3.6
    meters.push(meters[i - 1] + avgSpeed * dt)
  }

  const total = meters[meters.length - 1]
  if (total <= 0) return []
  // Normalizamos a % de vuelta para que ambos pilotos queden alineados
  return samples.map((s, i) => ({ x: (meters[i] / total) * 100, y: s.speed }))
}

/** Interpolación lineal de una serie sobre una rejilla; fuera de su rango devuelve null */
function interpolate(points: Point[], grid: number[]): (number | null)[] {
  if (points.length < 2) return grid.map(() => null)

  const out: (number | null)[] = []
  let i = 0
  for (const gx of grid) {
    if (gx < points[0].x || gx > points[points.length - 1].x) {
      out.push(null)
      continue
    }
    while (i < points.length - 2 && points[i + 1].x < gx) i++
    const p0 = points[i]
    const p1 = points[i + 1]
    const span = p1.x - p0.x
    out.push(span === 0 ? p0.y : round(p0.y + ((p1.y - p0.y) * (gx - p0.x)) / span))
  }
  return out
}

export function buildChartRows(
  a: LapTelemetry,
  b: LapTelemetry,
  mode: XAxisMode,
): ChartRow[] {
  const pa = toPoints(a, mode)
  const pb = toPoints(b, mode)
  if (pa.length === 0 && pb.length === 0) return []

  const lastX = (points: Point[]) => (points.length ? points[points.length - 1].x : 0)
  const maxX = mode === 'distance' ? 100 : Math.max(lastX(pa), lastX(pb))

  const grid = Array.from({ length: STEPS + 1 }, (_, i) => (maxX * i) / STEPS)
  const ya = interpolate(pa, grid)
  const yb = interpolate(pb, grid)

  return grid.map((x, i) => ({ x: round(x, 2), a: ya[i], b: yb[i] }))
}

/** 81.456 → "1:21.456" */
export function formatLapTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const rest = (seconds - minutes * 60).toFixed(3).padStart(6, '0')
  return `${minutes}:${rest}`
}