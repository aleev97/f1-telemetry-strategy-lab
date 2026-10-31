import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { driverColor } from '@/lib/teams'
import type { Driver, LapTelemetry } from '@/types/f1'
import { buildChartRows, type XAxisMode } from './chardata'

interface SpeedChartProps {
  telemetryA: LapTelemetry
  telemetryB: LapTelemetry
  driverA: Driver
  driverB: Driver
  mode: XAxisMode
}

const AXIS = { fill: '#8B93A7', fontSize: 11 }
const AXIS_LINE = 'rgba(255,255,255,0.1)'

export function SpeedChart({ telemetryA, telemetryB, driverA, driverB, mode }: SpeedChartProps) {
  const reduceMotion = useReducedMotion()
  const rows = useMemo(
    () => buildChartRows(telemetryA, telemetryB, mode),
    [telemetryA, telemetryB, mode],
  )

  const colorA = driverColor(driverA)
  const colorB = driverColor(driverB)
  // Compañeros de equipo → mismo color: el piloto B se dibuja discontinuo
  const sameColor = colorA.toLowerCase() === colorB.toLowerCase()

  return (
    <div className="h-72 sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 'dataMax']}
            tick={AXIS}
            stroke={AXIS_LINE}
            tickFormatter={(v: number) => (mode === 'time' ? `${Math.round(v)} s` : `${Math.round(v)}%`)}
          />
          <YAxis width={44} domain={[0, 'auto']} tick={AXIS} stroke={AXIS_LINE} />
          <Tooltip
            contentStyle={{
              background: '#11151D',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: '#8B93A7' }}
            cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
            labelFormatter={(x) =>
              mode === 'time' ? `${Number(x).toFixed(1)} s` : `${Number(x).toFixed(0)} % de la vuelta`
            }
            formatter={(value) => (typeof value === 'number' ? `${Math.round(value)} km/h` : '—')}
          />
          <Line
            name={driverA.acronym}
            dataKey="a"
            stroke={colorA}
            strokeWidth={2}
            dot={false}
            isAnimationActive={!reduceMotion}
            animationDuration={900}
          />
          <Line
            name={driverB.acronym}
            dataKey="b"
            stroke={colorB}
            strokeWidth={2}
            strokeDasharray={sameColor ? '6 4' : undefined}
            dot={false}
            isAnimationActive={!reduceMotion}
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}