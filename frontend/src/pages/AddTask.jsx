import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import Topbar from '../components/Topbar'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { mockUsers } from '../mockData'

export default function AddTask() {
  const navigate = useNavigate()
  const { offline } = useAuth()
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({
    title: '',
    category: '',
    assignee_id: '',
    due_date: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (offline) {
      setUsers(mockUsers.filter((u) => u.role === 'user'))
      return
    }
    client
      .get('/api/users')
      .then((res) => setUsers(res.data.filter((u) => u.role === 'user')))
      .catch((err) => {
        if (!err.response) setUsers(mockUsers.filter((u) => u.role === 'user'))
      })
  }, [offline])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    if (offline) {
      // No backend to persist to in demo mode — just confirm and return to the task list.
      setTimeout(() => {
        setSaving(false)
        navigate('/admin/tasks')
      }, 300)
      return
    }

    try {
      await client.post('/api/tasks', {
        ...form,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        assignee_id: form.assignee_id || null,
      })
      navigate('/admin/tasks')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create task.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <Topbar title="Add New Task" subtitle="Assign a new task to a team member." />

      {offline && (
        <div className="mb-5 px-4 py-2.5 rounded-xl bg-orange-50 text-accent-orange text-sm font-medium">
          Demo mode — backend isn't connected, so this task won't be saved.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 max-w-xl space-y-4">
        <div>
          <label className="text-xs font-semibold text-ink-700">Task Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Week 1"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-700">Description</label>
          <input
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Tasks Overview and Problem Statement"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-700">Category</label>
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Choose a Domain"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink-700">Assign To</label>
            <select
              value={form.assignee_id}
              onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-700">Due Date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-primary hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Create Task'}
        </button>
      </form>
    </DashboardLayout>
  )
}
