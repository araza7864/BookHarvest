import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../api/client'
import Sparkles from '../components/graphics/Sparkles'
import WavingHand from '../components/graphics/WavingHand'
import RainbowDivider from '../components/graphics/RainbowDivider'
import BookHarvestLogo from '../components/graphics/BookHarvestLogo'
import { useAuth } from '../context/AuthContext'
import type { User } from '../api/client'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('user')
  const [adminInviteCode, setAdminInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let data: { access_token?: string; accessToken?: string; user: User }
      if (isRegister) {
        const res = await api.post<{ access_token?: string; accessToken?: string; user: User }>('/auth/register', {
          name,
          email,
          password,
          role,
          admin_invite_code: role === 'admin' ? adminInviteCode : undefined,
        })
        data = res.data as { access_token?: string; user: User }
      } else {
        const res = await api.post<{ access_token?: string; accessToken?: string; user: User }>('/auth/login', { email, password })
        data = res.data as { access_token?: string; user: User }
      }
      const token = data?.access_token ?? (data as { accessToken?: string })?.accessToken
      if (!token || !data?.user) {
        setError('Invalid response from server. Check backend is running (http://localhost:8000/health).')
        return
      }
      login(token, data.user)
      if (data.user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (redirectTo === 'shop') {
        navigate('/search', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err: any) {
      const data = err.response?.data
      const detail = data?.detail
      const status = err.response?.status
      const is401 = status === 401
      const isLogin = !isRegister
      // For login, only show "Invalid email or password" for actual 401; otherwise show real error
      let msg: string
      if (isLogin && is401) {
        msg = 'Invalid email or password'
      } else {
        msg =
          Array.isArray(detail)
            ? detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(' ')
            : typeof detail === 'string'
              ? detail
              : data != null && typeof data === 'object'
                ? JSON.stringify(data)
                : status
                  ? `Error ${status}: ${err.message || 'Request failed'}`
                  : err.message || 'Request failed'
        if (!err.response) {
          msg = `Cannot reach server. Is the backend running? Start it with: cd backend && uvicorn main:app --reload --port 8000. (${msg})`
        }
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-stone-100 p-4 relative overflow-hidden">
      <Sparkles count={6} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative z-10 border border-stone-200"
      >
        <div className="text-center mb-6">
          <BookHarvestLogo height={96} className="mx-auto block" />
          <h1 className="font-display font-bold text-2xl md:text-3xl text-stone-800 mt-3">
            Book Harvest <WavingHand className="text-2xl md:text-3xl" />
          </h1>
          <p className="text-stone-500 text-lg">{isRegister ? 'Create an account' : 'Welcome back'}</p>
        </div>
        <RainbowDivider className="my-4 w-full" />
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg bg-stone-50 text-stone-800 cursor-pointer transition-all duration-200 ease-out focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white hover:border-stone-400 hover:bg-stone-100 focus:outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {role === 'admin' && (
                <input type="password" placeholder="Admin invite code (required)" value={adminInviteCode} onChange={(e) => setAdminInviteCode(e.target.value)} required className="w-full px-4 py-2 border border-stone-300 rounded-lg" />
              )}
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-harvest-dark-red text-white py-3 rounded-xl font-semibold text-lg hover:opacity-90 disabled:opacity-50 transition">
            {loading ? '...' : isRegister ? 'Create an account' : 'Log in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-500">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-harvest-dark-red font-medium hover:underline">
            {isRegister ? 'Log in' : 'Register'}
          </button>
        </p>
        <p className="mt-2 text-center">
          {redirectTo === 'shop' ? (
            <a
              href="/search"
              className="text-stone-500 text-sm hover:underline"
            >
              Back to store
            </a>
          ) : (
            <Link to="/" className="text-stone-500 text-sm hover:underline">Back to home</Link>
          )}
        </p>
      </motion.div>
    </div>
  )
}
