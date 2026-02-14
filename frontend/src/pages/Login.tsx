import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { User } from '../api/client'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('user')
  const [vehicleMpg, setVehicleMpg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        const { data } = await api.post<{ access_token: string; user: User }>('/auth/register', {
          name,
          email,
          password,
          role,
          vehicle_mpg: role === 'driver' && vehicleMpg ? parseFloat(vehicleMpg) : undefined,
        })
        login(data.access_token, data.user)
      } else {
        const { data } = await api.post<{ access_token: string; user: User }>('/auth/login', { email, password })
        login(data.access_token, data.user)
      }
      const u = data.user
      if (u.role === 'admin') navigate('/admin')
      else if (u.role === 'driver') navigate('/driver')
      else navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <span className="text-5xl">📚</span>
          <h1 className="font-display font-bold text-2xl text-primary-700 mt-2">SeamlessBook</h1>
          <p className="text-stone-500">{isRegister ? 'Create an account' : 'Welcome back'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="driver">Driver</option>
              </select>
              {role === 'driver' && (
                <input type="number" step="0.1" placeholder="Vehicle MPG (optional)" value={vehicleMpg} onChange={(e) => setVehicleMpg(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg" />
              )}
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-primary-500 text-white py-2 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50">
            {loading ? '...' : isRegister ? 'Register' : 'Log in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-500">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-primary-600 font-medium hover:underline">
            {isRegister ? 'Log in' : 'Register'}
          </button>
        </p>
        <p className="mt-2 text-center">
          <Link to="/" className="text-stone-500 text-sm hover:underline">Back to home</Link>
        </p>
      </motion.div>
    </div>
  )
}
