import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function PublicLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary-500 text-white shadow-lg sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-xl flex items-center gap-2">
            <span className="text-3xl">📚</span>
            SeamlessBook
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/search" className="hover:underline font-medium">Find Books</Link>
            {user ? (
              <div className="flex gap-3">
                {user.role === 'admin' && <Link to="/admin" className="bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30">Admin</Link>}
                {user.role === 'driver' && <Link to="/driver" className="bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30">Deliver</Link>}
                <span className="text-primary-100">{user.name}</span>
              </div>
            ) : (
              <Link to="/login" className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50">Log in</Link>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-stone-200 py-6 text-center text-stone-600 text-sm">
        SeamlessBook — Share Books, Spread Joy
      </footer>
    </div>
  )
}
