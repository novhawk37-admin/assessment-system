import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS = ['#6C5CE7', '#3B82F6', '#22B07D', '#F5A623', '#EC4899']

export default function DonutChart({ data, centerLabel, centerValue, dataKey = 'value', nameKey = 'name' }) {
  return (
    <div className="relative w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius="65%"
            outerRadius="90%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-2xl font-extrabold text-ink-900">{centerValue}</p>
        <p className="text-xs text-ink-500">{centerLabel}</p>
      </div>
    </div>
  )
}

export { COLORS }
