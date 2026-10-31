import { DRY_COMPOUNDS, type DryCompound, type StrategyFormValues } from './schema'

/** Todo lo del formulario excepto el plan de stints */
export type EngineParams = Omit<StrategyFormValues, 'stints'>

export interface PlannedStint {
  compound: DryCompound
  laps: number
}

/** Largo mínimo de stint en las estrategias alternativas que buscamos */
export const MIN_ALT_STINT = 5
/** Una parada está "en ventana" si cuesta hasta 1 s más que la óptima */
export const WINDOW_THRESHOLD_SEC = 1

/** Tiempo de conducción de un stint (serie aritmética de la degradación) */
export function stintTime(p: EngineParams, compound: DryCompound, laps: number): number {
  const { offsetSec, degSec } = p.tyres[compound]
  return laps * (p.baseLapSec + offsetSec) + (degSec * laps * (laps - 1)) / 2
}

export function raceTime(p: EngineParams, stints: PlannedStint[]): number {
  const driving = stints.reduce((sum, s) => sum + stintTime(p, s.compound, s.laps), 0)
  return driving + p.pitLossSec * (stints.length - 1)
}

/** Vueltas en las que ocurre cada parada: el final de cada stint salvo el último */
export function pitLapNumbers(stints: PlannedStint[]): number[] {
  const laps: number[] = []
  let end = 0
  for (const s of stints.slice(0, -1)) {
    end += s.laps
    laps.push(end)
  }
  return laps
}

// ---------- Degradación vuelta a vuelta ----------

export interface LapPoint {
  lap: number
  stintIndex: number
  timeSec: number
}

export function lapByLap(p: EngineParams, stints: PlannedStint[]): LapPoint[] {
  const points: LapPoint[] = []
  let lap = 1
  stints.forEach((s, stintIndex) => {
    const { offsetSec, degSec } = p.tyres[s.compound]
    for (let age = 0; age < s.laps; age++) {
      points.push({ lap: lap++, stintIndex, timeSec: p.baseLapSec + offsetSec + degSec * age })
    }
  })
  return points
}

// ---------- Ventana de parada ----------

export interface PitWindow {
  stop: number
  currentLap: number
  optimalLap: number
  fromLap: number
  toLap: number
  costVsOptimalSec: number
}

/**
 * Para cada parada: mueve solo esa frontera entre dos stints, deja el resto del plan igual
 * y busca la vuelta óptima y el rango que cuesta menos de `threshold` segundos extra.
 */
export function pitWindows(
  p: EngineParams,
  stints: PlannedStint[],
  threshold = WINDOW_THRESHOLD_SEC,
): PitWindow[] {
  const windows: PitWindow[] = []
  let startLap = 1

  for (let i = 0; i < stints.length - 1; i++) {
    const a = stints[i]
    const b = stints[i + 1]
    const span = a.laps + b.laps
    // x = vueltas del primer stint; el segundo se queda con el resto
    const cost = (x: number) => stintTime(p, a.compound, x) + stintTime(p, b.compound, span - x)

    let bestX = 1
    let bestCost = Infinity
    for (let x = 1; x < span; x++) {
      const c = cost(x)
      if (c < bestCost) {
        bestCost = c
        bestX = x
      }
    }

    // La curva de coste es convexa (degradación >= 0): la ventana es un rango continuo
    let from = bestX
    let to = bestX
    while (from > 1 && cost(from - 1) <= bestCost + threshold) from--
    while (to < span - 1 && cost(to + 1) <= bestCost + threshold) to++

    windows.push({
      stop: i + 1,
      currentLap: startLap + a.laps - 1,
      optimalLap: startLap + bestX - 1,
      fromLap: startLap + from - 1,
      toLap: startLap + to - 1,
      costVsOptimalSec: cost(a.laps) - bestCost,
    })
    startLap += a.laps
  }
  return windows
}

// ---------- Mejores estrategias alternativas ----------

export interface Candidate {
  stints: PlannedStint[]
  totalSec: number
}

/** La mejor estrategia con exactamente `stops` paradas, o null si no caben stints de largo mínimo */
function searchBest(p: EngineParams, stops: number): Candidate | null {
  const parts = stops + 1
  if (p.raceLaps < parts * MIN_ALT_STINT) return null

  const pitTotal = p.pitLossSec * stops
  const plan: PlannedStint[] = []
  let best: Candidate | null = null

  // mask: un bit por compuesto usado. Hay >= 2 compuestos distintos si no es potencia de 2
  function dfs(index: number, remaining: number, time: number, mask: number) {
    // Poda: el tiempo parcial ya no puede mejorar al mejor encontrado
    if (best && time >= best.totalSec - pitTotal) return

    const isLast = index === parts - 1
    const partsAfter = parts - index - 1
    const minLaps = isLast ? remaining : MIN_ALT_STINT
    const maxLaps = isLast ? remaining : remaining - partsAfter * MIN_ALT_STINT

    for (let laps = minLaps; laps <= maxLaps; laps++) {
      for (let c = 0; c < DRY_COMPOUNDS.length; c++) {
        const compound = DRY_COMPOUNDS[c]
        const next = time + stintTime(p, compound, laps)
        const nextMask = mask | (1 << c)

        plan.push({ compound, laps })
        if (!isLast) {
          dfs(index + 1, remaining - laps, next, nextMask)
        } else if ((nextMask & (nextMask - 1)) !== 0 && (!best || next + pitTotal < best.totalSec)) {
          best = { stints: plan.map((s) => ({ ...s })), totalSec: next + pitTotal }
        }
        plan.pop()
      }
    }
  }

  dfs(0, p.raceLaps, 0, 0)
  return best
}

/** Mejor estrategia con 1, 2 y 3 paradas (las que sean posibles) */
export function bestStrategies(p: EngineParams): Candidate[] {
  return [1, 2, 3]
    .map((stops) => searchBest(p, stops))
    .filter((c): c is Candidate => c !== null)
}

// ---------- Métricas para los medidores ----------

/** Segundos perdidos por desgaste: degradación × edad, sumado en todos los stints */
export function degradationLoss(p: EngineParams, stints: PlannedStint[]): number {
  return stints.reduce(
    (sum, s) => sum + (p.tyres[s.compound].degSec * s.laps * (s.laps - 1)) / 2,
    0,
  )
}

// ---------- Formato ----------

const pad2 = (n: number) => String(n).padStart(2, '0')

/** 5183.34 → "1:26:23.340" */
export function formatRaceTime(totalSec: number): string {
  const ms = Math.round(totalSec * 1000)
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1000)
  return `${h}:${pad2(m)}:${pad2(s)}.${String(ms % 1000).padStart(3, '0')}`
}

export function formatDelta(sec: number): string {
  return `${sec >= 0 ? '+' : '−'}${Math.abs(sec).toFixed(3)} s`
}