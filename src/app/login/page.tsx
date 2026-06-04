// src/app/login/page.tsx
'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://resourceful-presence-production-a383.up.railway.app'

      const formData = new URLSearchParams()
      formData.append('username', username)
      formData.append('password', password)

      const response = await fetch(apiUrl + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Login failed')
      }

      const data = await response.json()
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem', background: 'white', borderRadius: '0.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem' }}>Grocery POS</h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>Owner Dashboard Login</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }}
              required
            />
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#2563eb', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          Default: admin / admin123
        </p>
      </div>
    </div>
  )
}