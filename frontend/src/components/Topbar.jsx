import React from 'react'
import { LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ title, subtitle, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = React.useState(false)

  function handleLogout() {
    console.log("Logout clicked");

    logout();

    console.log("After logout");

    navigate("/", { replace: true });

    console.log("Navigation done");
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">

        {children}

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
