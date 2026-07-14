import React, { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client'
import { demoCredentials } from '../mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(localStorage.getItem('novhawk_offline') === 'true')

  useEffect(() => {
    const stored = localStorage.getItem('novhawk_user')
    const token = localStorage.getItem('novhawk_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  function loginOffline(email, password) {
    const match = demoCredentials.find(
      (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password,
    )
    if (!match) {
      throw new Error(
        'Backend not reachable. Use a demo account: admin@novhawk.com / admin123 or vishnu@novhawk.com / password123',
      )
    }
    localStorage.setItem('novhawk_token', 'demo-token')
    localStorage.setItem('novhawk_user', JSON.stringify(match.user))
    localStorage.setItem('novhawk_offline', 'true')
    setOffline(true)
    setUser(match.user)
    return match.user
  }

  async function login(email, password) {
    try {
      const res = await client.post('/api/auth/login', { email, password })
      localStorage.setItem('novhawk_token', res.data.access_token)
      localStorage.setItem('novhawk_user', JSON.stringify(res.data.user))
      localStorage.removeItem('novhawk_offline')
      setOffline(false)
      setUser(res.data.user)
      return res.data.user
    } catch (err) {
      // No response from the server at all = backend isn't running/reachable.
      // Fall back to static demo data so the UI can still be previewed.
      if (!err.response) {
        return loginOffline(email, password)
      }
      throw err
    }
  }

  async function register(payload) {
    const res = await client.post('/api/auth/register', payload)
    localStorage.setItem('novhawk_token', res.data.access_token)
    localStorage.setItem('novhawk_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  function logout() {
    localStorage.removeItem('novhawk_token')
    localStorage.removeItem('novhawk_user')
    localStorage.removeItem('novhawk_offline')
    setOffline(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, offline, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
