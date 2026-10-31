import { mkdir, writeFile } from 'node:fs/promises'

const YEAR = 2025
const JOLPICA = 'https://api.jolpi.ca/ergast/f1'
const OPENF1 = 'https://api.openf1.org/v1'
const DELAY_MS = 600 // ~1,7 peticiones/s: por debajo del límite de OpenF1
const TARGET_POINTS = 160 // puntos por trazado: suficiente detalle, JSON liviano
const VIEW = 100
const PAD = 4

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** fetch educado: espera entre peticiones y reintenta ante 429 / 5xx */
async function getJson(url, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    await sleep(DELAY_MS)
    const res = await fetch(url)
    if (res.ok) return res.json()
    if (res.status === 404) return [] // OpenF1: filtro sin resultados
    if (res.status === 429 || res.status >= 500) {
      await sleep(2000 * (attempt + 1))
      continue
    }
    throw new Error(`HTTP ${res.status} en ${url}`)
  }
  throw new Error(`Sin respuesta tras ${retries} reintentos: ${url}`)
}

async function loadRaces() {
  const json = await getJson(`${JOLPICA}/${YEAR}/races.json?limit=100`)
  return json.MRData.RaceTable.Races.map((r) => ({
    circuitId: r.Circuit.circuitId,
    name: r.raceName,
    start: new Date(`${r.date}T${r.time ?? '00:00:00Z'}`).getTime(),
  }))
}

/** Sesión de OpenF1 cuya fecha de inicio es la más cercana a la carrera (máx. 24 h) */
function matchSession(race, sessions) {
  let best = null
  let bestDiff = Infinity
  for (const s of sessions) {
    const diff = Math.abs(new Date(s.date_start).getTime() - race.start)
    if (diff < bestDiff) {
      best = s
      bestDiff = diff
    }
  }
  return bestDiff < 24 * 3600 * 1000 ? best : null
}

/** Una vuelta "limpia": con tiempo válido y que no sea de salida de boxes */
async function findCleanLap(sessionKey) {
  const drivers = await getJson(`${OPENF1}/drivers?session_key=${sessionKey}`)
  for (const d of drivers.slice(0, 6)) {
    const laps = await getJson(
      `${OPENF1}/laps?session_key=${sessionKey}&driver_number=${d.driver_number}&lap_number=10`,
    )
    const lap = laps[0]
    if (lap?.date_start && lap.lap_duration && !lap.is_pit_out_lap) {
      return { driver: d.driver_number, lap }
    }
  }
  return null
}

async function getLapPoints(sessionKey, driver, lap) {
  const start = new Date(lap.date_start)
  const end = new Date(start.getTime() + lap.lap_duration * 1000)
  const url =
    `${OPENF1}/location?session_key=${sessionKey}&driver_number=${driver}` +
    `&date>=${start.toISOString()}&date<${end.toISOString()}`
  const rows = await getJson(url)
  return rows
    .filter((r) => Number.isFinite(r.x) && Number.isFinite(r.y))
    .map((r) => ({ x: r.x, y: -r.y })) // el eje Y de SVG crece hacia abajo
}

/** Reduce puntos, normaliza a un viewBox de ~100 conservando la proporción y arma el path */
function toTrace(points) {
  const step = Math.max(1, Math.floor(points.length / TARGET_POINTS))
  const sampled = points.filter((_, i) => i % step === 0)

  const xs = sampled.map((p) => p.x)
  const ys = sampled.map((p) => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const spanX = Math.max(...xs) - minX
  const spanY = Math.max(...ys) - minY
  const scale = (VIEW - 2 * PAD) / Math.max(spanX, spanY)

  const d =
    sampled
      .map((p, i) => {
        const x = ((p.x - minX) * scale + PAD).toFixed(1)
        const y = ((p.y - minY) * scale + PAD).toFixed(1)
        return `${i === 0 ? 'M' : 'L'}${x} ${y}`
      })
      .join('') + 'Z'

  return {
    path: d,
    viewBox: `0 0 ${(spanX * scale + 2 * PAD).toFixed(1)} ${(spanY * scale + 2 * PAD).toFixed(1)}`,
  }
}

async function main() {
  console.log(`Generando trazados a partir de la temporada ${YEAR}…`)
  const races = await loadRaces()
  const sessions = await getJson(`${OPENF1}/sessions?year=${YEAR}&session_name=Race`)

  const result = {}
  const failed = []

  for (const race of races) {
    if (result[race.circuitId]) continue // circuitos repetidos en el calendario

    try {
      const session = matchSession(race, sessions)
      if (!session) throw new Error('sin sesión equivalente en OpenF1')

      const found = await findCleanLap(session.session_key)
      if (!found) throw new Error('no se encontró una vuelta limpia')

      const points = await getLapPoints(session.session_key, found.driver, found.lap)
      if (points.length < 50) throw new Error(`pocos puntos (${points.length})`)

      result[race.circuitId] = {
        ...toTrace(points),
        source: { year: YEAR, sessionKey: session.session_key },
      }
      console.log(`✔ ${race.circuitId} (${points.length} puntos)`)
    } catch (err) {
      failed.push(race.circuitId)
      console.warn(`✘ ${race.circuitId}: ${err.message}`)
    }
  }

  const outDir = new URL('../src/data/', import.meta.url)
  await mkdir(outDir, { recursive: true })
  await writeFile(new URL('circuits.json', outDir), JSON.stringify(result, null, 2))

  console.log(`\nListo: ${Object.keys(result).length} circuitos generados, ${failed.length} fallidos.`)
  if (failed.length) console.log('Fallidos:', failed.join(', '))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})