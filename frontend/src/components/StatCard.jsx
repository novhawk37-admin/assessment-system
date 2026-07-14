import React from 'react'

const colorMap = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-700', icon: 'bg-primary-100 text-primary-700' },
  orange: { bg: 'bg-orange-50', text: 'text-accent-orange', icon: 'bg-orange-100 text-accent-orange' },
  green: { bg: 'bg-green-50', text: 'text-accent-green', icon: 'bg-green-100 text-accent-green' },
  blue: { bg: 'bg-blue-50', text: 'text-accent-blue', icon: 'bg-blue-100 text-accent-blue' },
}

export default function StatCard({ label, value, footnote, icon: Icon, color = 'primary', progress }) {
  const c = colorMap[color] || colorMap.primary
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 flex-1 min-w-[200px]">
      <div className="flex items-start justify-between">
        <p className={`text-sm font-semibold ${c.text}`}>{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <p className="text-3xl font-extrabold text-ink-900 mt-2">{value}</p>
      {footnote && <p className="text-xs font-medium text-ink-500 mt-1">{footnote}</p>}
      {typeof progress === 'number' && (
        <div className="w-full h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-orange to-orange-300 rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
