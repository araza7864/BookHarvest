import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function DriverLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-accent-50">
      <header className="bg-accent-600 text-white shadow-md">
        <nav className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NavLink to="/driver" end className="font-display font-bold text-lg">🚗 Delivery</NavLink>
            <NavLink to="/driver/credits" className={({ isActive }) => `px-3 py-1 rounded-lg ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`}>Credits</NavLink>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-accent-100">{user?.name}</span>
            <span className="bg-white/20 px-2 py-1 rounded text-sm">{(user as any)?.credits_balance ?? 0} credits</span>
            <a href="/" onClick={(e) => { e.preventDefault(); logout(); window.location.href = '/'; }} className="text-sm hover:underline">Sign out</a>
          </div>
        </nav>
      </header>
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
