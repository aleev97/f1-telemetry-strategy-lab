import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TYRES } from '@/lib/tyres'
import { lapByLap, pitLapNumbers, type EngineParams, type PlannedStint } from './engine'

const AXIS = { fill: '#8B93A7', fontSize: 11 }
const AXIS_LINE = 'rgba(255,255,255,0.1)'

interface DegradationChartProps {
  params: EngineParams
  stints: PlannedStint[]
}

export function DegradationChart({ params, stints }: DegradationChartProps) {
  const rows = useMemo(
    () => lapByLap(params, stints).map((pt) => ({ lap: pt.lap, [`s${pt.stintIndex}`]: pt.timeSec })),
    [params, stints],
  )
  const pits = useMemo(() => pitLapNumbers(stints), [stints])

  return (
    <div className="h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 16, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            type="number"
            dataKey="lap"
            domain={[1, params.raceLaps]}
            allowDecimals={false}
            tick={AXIS}
            stroke={AXIS_LINE}
          />
          <YAxis
            width={48}
            domain={['dataMin - 0.3', 'dataMax + 0.3']}
            tickFormatter={(v: number) => v.toFixed(1)}
            tick={AXIS}
            stroke={AXIS_LINE}
          />
          <Tooltip
            contentStyle={{
              background: '#11151D',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: '#8B93A7' }}
            cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
            labelFormatter={(lap) => `Vuelta ${lap}`}
            formatter={(value) => (typeof value === 'number' ? `${value.toFixed(3)} s` : '—')}
          />

          {pits.map((lap) => (
            <ReferenceLine
              key={lap}
              x={lap + 0.5} // entre la última vuelta del stint y la primera del siguiente
              stroke="rgba(255,255,255,0.35)"
              strokeDasharray="4 4"
              label={{ value: 'PIT', position: 'top', fill: '#8B93A7', fontSize: 10 }}
            />
          ))}

          {stints.map((s, i) => (
            <Line
              key={i}
              name={`Stint ${i + 1} · ${TYRES[s.compound].label}`}
              dataKey={`s${i}`}
              stroke={TYRES[s.compound].color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false} // el gráfico se recalcula al teclear
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}