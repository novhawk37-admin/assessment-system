import React, { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Trash2 } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import Topbar from '../components/Topbar'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { mockTasks } from '../mockData'

const statusStyles = {
  assigned: 'bg-gray-100 text-ink-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

export default function Tasks() {
  const { user, offline } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(offline)

  function load() {
    if (offline) {
      setTasks(mockTasks)
      setLoading(false)
      return
    }
    setLoading(true)
    client
      .get('/api/tasks')
      .then((res) => setTasks(res.data))
      .catch((err) => {
        if (!err.response) {
          setUsingMock(true)
          setTasks(mockTasks)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offline])

  async function toggleComplete(task) {
    if (usingMock) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: t.status === 'completed' ? 'assigned' : 'completed' } : t,
        ),
      )
      return
    }
    const nextStatus = task.status === 'completed' ? 'assigned' : 'completed'
    await client.put(`/api/tasks/${task.id}`, { status: nextStatus })
    load()
  }

  async function removeTask(id) {
    if (!confirm('Delete this task?')) return
    if (usingMock) {
      setTasks((prev) => prev.filter((t) => t.id !== id))
      return
    }
    await client.delete(`/api/tasks/${id}`)
    load()
  }

  return (
    <DashboardLayout>
      <Topbar title={isAdmin ? 'All Tasks' : 'My Tasks'}
        subtitle="Track and manage tasks in one place."
        showBack
      />

      {usingMock && (
        <div className="mb-5 px-4 py-2.5 rounded-xl bg-orange-50 text-accent-orange text-sm font-medium">
          Showing static demo data — backend isn't connected.
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-ink-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Task</th>
              <th className="text-left px-5 py-3 font-semibold">Description</th>
              <th className="text-left px-5 py-3 font-semibold">Category</th>
              {isAdmin && <th className="text-left px-5 py-3 font-semibold">Assignee</th>}
              <th className="text-left px-5 py-3 font-semibold">Due Date</th>
              <th className="text-left px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {!loading && tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-ink-500">
                  No tasks yet.
                </td>
              </tr>
            )}
            {tasks.map((t) => (
              <tr key={t.id} className="border-t border-gray-100">
                <td className="px-5 py-3">
                  <button onClick={() => toggleComplete(t)} className="flex items-center gap-2 text-left">
                    {t.status === 'completed' ? (
                      <CheckCircle2 size={18} className="text-accent-green" />
                    ) : (
                      <Circle size={18} className="text-ink-500" />
                    )}
                    <span className={t.status === 'completed' ? 'line-through text-ink-500' : 'text-ink-900 font-medium'}>
                      {t.title}
                    </span>
                  </button>
                </td>
                <td className="px-5 py-3 text-ink-700">{t.description || '-'}</td>
                <td className="px-5 py-3 text-ink-700">{t.category || '-'}</td>
                {isAdmin && <td className="px-5 py-3 text-ink-700">{t.assignee_name || '-'}</td>}
                <td className="px-5 py-3 text-ink-700">
                  {t.due_date ? new Date(t.due_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[t.status]}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {isAdmin && (
                    <button onClick={() => removeTask(t.id)} className="text-ink-500 hover:text-red-600">
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
