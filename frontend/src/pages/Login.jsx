import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
            N
          </div>
          <span className="text-lg font-extrabold text-ink-900">NovHawk</span>
        </div>

        <h1 className="text-xl font-bold text-ink-900">Welcome back</h1>
        <p className="text-sm text-ink-500 mt-1 mb-6">Log in to your learning journey.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink-700">Email</label>
            <input
              type="email"
              value={email}
              placeholder="yourname@novhawk.com"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-700">Password</label>
            <input
              type="password"
              value={password}
              placeholder="novhawk123"
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        {/* <div className="mt-6 text-xs text-ink-500 bg-gray-50 rounded-xl p-3 space-y-1">
          <p className="font-semibold text-ink-700">Demo accounts (after seeding):</p>
          <p>Admin: admin@novhawk.com / admin123</p>
          <p>User: vishnu@novhawk.com / password123</p>
        </div> */}
      </div>
    </div>
  )
}
