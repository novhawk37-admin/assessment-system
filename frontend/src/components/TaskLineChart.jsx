import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TaskLineChart({ data }) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF0F5" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#8B90A0' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#8B90A0' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #EEF0F5' }} />
          <Line type="monotone" dataKey="assigned" stroke="#6C5CE7" strokeWidth={2.5} dot={{ r: 3 }} name="Assigned" />
          <Line type="monotone" dataKey="completed" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} name="Completed" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
