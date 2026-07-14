import React, { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import Topbar from '../components/Topbar'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { mockAssessments, mockUsers } from '../mockData'

const ASSESSMENT_TYPES = ['Technical', 'Aptitude', 'Coding', 'Communication']

export default function Assessments() {
  const { user, offline } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ name: '', type: 'Technical', score: '', user_id: '' })
  const [error, setError] = useState('')
  const [usingMock, setUsingMock] = useState(offline)

  function load() {
    if (offline) {
      setItems(mockAssessments)
      return
    }
    client
      .get('/api/assessments')
      .then((res) => setItems(res.data))
      .catch((err) => {
        if (!err.response) {
          setUsingMock(true)
          setItems(mockAssessments)
        }
      })
  }

  useEffect(() => {
    load()
    if (isAdmin) {
      if (offline) {
        setUsers(mockUsers.filter((u) => u.role === 'user'))
      } else {
        client
          .get('/api/users')
          .then((res) => setUsers(res.data.filter((u) => u.role === 'user')))
          .catch((err) => {
            if (!err.response) setUsers(mockUsers.filter((u) => u.role === 'user'))
          })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, offline])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    if (usingMock) {
      const newItem = {
        id: `mock-${Date.now()}`,
        name: form.name,
        type: form.type,
        score: Number(form.score),
        user_id: form.user_id,
        taken_at: new Date().toISOString(),
      }
      setItems((prev) => [newItem, ...prev])
      setForm({ name: '', type: 'Technical', score: '', user_id: '' })
      return
    }
    try {
      await client.post('/api/assessments', { ...form, score: Number(form.score) })
      setForm({ name: '', type: 'Technical', score: '', user_id: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create assessment.')
    }
  }

  async function removeItem(id) {
    if (!confirm('Delete this assessment?')) return
    if (usingMock) {
      setItems((prev) => prev.filter((a) => a.id !== id))
      return
    }
    await client.delete(`/api/assessments/${id}`)
    load()
  }

  return (
    <DashboardLayout>
      <Topbar
        title={isAdmin ? 'Assessment Analytics' : 'My Assessments'}
        subtitle={isAdmin ? 'Create and review assessments across the platform.' : 'Your assessment history and scores.'}
      />

      {usingMock && (
        <div className="mb-5 px-4 py-2.5 rounded-xl bg-orange-50 text-accent-orange text-sm font-medium">
          Showing static demo data — backend isn't connected.
        </div>
      )}

      {isAdmin && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-card p-5 mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            required
            placeholder="Assessment name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 md:col-span-2"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {ASSESSMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            required
            value={form.user_id}
            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              required
              type="number"
              min="0"
              max="100"
              placeholder="Score"
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button type="submit" className="bg-primary hover:bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-xl whitespace-nowrap">
              Add
            </button>
          </div>
          {error && <p className="text-sm text-red-600 md:col-span-5">{error}</p>}
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-ink-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Assessment</th>
              <th className="text-left px-5 py-3 font-semibold">Type</th>
              <th className="text-left px-5 py-3 font-semibold">Score</th>
              <th className="text-left px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-500">No assessments yet.</td>
              </tr>
            )}
            {items.map((a) => (
              <tr key={a.id} className="border-t border-gray-100">
                <td className="px-5 py-3 font-medium text-ink-900">{a.name}</td>
                <td className="px-5 py-3 text-ink-700">{a.type}</td>
                <td className="px-5 py-3 font-semibold text-ink-900">{a.score}%</td>
                <td className="px-5 py-3 text-ink-700">{new Date(a.taken_at).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-right">
                  {isAdmin && (
                    <button onClick={() => removeItem(a.id)} className="text-ink-500 hover:text-red-600">
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
