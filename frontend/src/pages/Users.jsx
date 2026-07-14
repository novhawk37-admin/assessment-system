import React, { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import Topbar from '../components/Topbar'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { mockUsers } from '../mockData'

export default function UsersPage() {
  const { offline } = useAuth()
  const [users, setUsers] = useState([])
  const [usingMock, setUsingMock] = useState(offline)

  function load() {
    if (offline) {
      setUsers(mockUsers)
      return
    }
    client
      .get('/api/users')
      .then((res) => setUsers(res.data))
      .catch((err) => {
        if (!err.response) {
          setUsingMock(true)
          setUsers(mockUsers)
        }
      })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offline])

  async function removeUser(id) {
    if (!confirm('Delete this user? This also removes their tasks and assessments.')) return
    if (usingMock) {
      setUsers((prev) => prev.filter((u) => u.id !== id))
      return
    }
    await client.delete(`/api/users/${id}`)
    load()
  }

  return (
    <DashboardLayout>
      <Topbar title="Users" subtitle="Manage everyone on the NovHawk platform." />

      {usingMock && (
        <div className="mb-5 px-4 py-2.5 rounded-xl bg-orange-50 text-accent-orange text-sm font-medium">
          Showing static demo data — backend isn't connected.
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-ink-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Name</th>
              <th className="text-left px-5 py-3 font-semibold">Email</th>
              <th className="text-left px-5 py-3 font-semibold">Role</th>
              <th className="text-left px-5 py-3 font-semibold">Title</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-5 py-3 flex items-center gap-2 font-medium text-ink-900">
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
                    {u.name[0]}
                  </div>
                  {u.name}
                </td>
                <td className="px-5 py-3 text-ink-700">{u.email}</td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-ink-700'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink-700">{u.title}</td>
                <td className="px-5 py-3 text-right">
                  {u.role !== 'admin' && (
                    <button onClick={() => removeUser(u.id)} className="text-ink-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
