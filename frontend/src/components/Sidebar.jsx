import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, FileCheck2, Users, PlusCircle, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const userLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Task', icon: ClipboardList },
  { to: '/assessments', label: 'Assessment', icon: FileCheck2 },
]

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/tasks', label: 'Task', icon: ClipboardList },
  { to: '/admin/tasks/new', label: 'Add New Task', icon: PlusCircle, nested: true },
  { to: '/admin/assessments', label: 'Analytics (Assessment)', icon: BarChart3 },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export default function Sidebar() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const links = isAdmin ? adminLinks : userLinks

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col h-full">
      <div className="px-6 py-6 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
          N
        </div>
        <span className="text-lg font-extrabold text-ink-900">NovHawk</span>
      </div>

      <div className="px-6 pb-2 text-xs font-semibold tracking-wide text-ink-500 uppercase">
        {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard' || link.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                link.nested ? 'ml-4' : ''
              } ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-ink-700 hover:bg-gray-50'
              }`
            }
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900 truncate">{user?.name}</p>
            <p className="text-xs text-ink-500 truncate">{user?.title}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
