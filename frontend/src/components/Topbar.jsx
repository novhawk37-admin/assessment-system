import React from 'react'
import { Bell, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ title, subtitle, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = React.useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">

        {children}

        <button className="relative w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center">
          <Bell size={18} className="text-ink-700" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            3
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
              {user?.name?.[0] || 'U'}
            </div>
            <ChevronDown size={16} className="text-ink-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-card border border-gray-100 py-1 z-10">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-ink-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-ink-500 truncate">
                  {user?.email}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
