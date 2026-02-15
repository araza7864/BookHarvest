import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex bg-stone-100">
      <aside className="w-56 bg-stone-800 text-white flex flex-col">
        <div className="p-4 border-b border-stone-600">
          <span className="font-display font-bold">Book Harvest</span>
          <span className="block text-stone-400 text-sm">Admin</span>
        </div>
        <nav className="p-2 flex-1">
          <NavLink to="/admin" end className={({ isActive }) => `block px-3 py-2 rounded-lg mb-1 ${isActive ? 'bg-primary-600' : 'hover:bg-stone-700'}`}>Dashboard</NavLink>
          <NavLink to="/admin/inventory" className={({ isActive }) => `block px-3 py-2 rounded-lg mb-1 ${isActive ? 'bg-primary-600' : 'hover:bg-stone-700'}`}>Inventory</NavLink>
          <NavLink to="/admin/deliveries" className={({ isActive }) => `block px-3 py-2 rounded-lg mb-1 ${isActive ? 'bg-primary-600' : 'hover:bg-stone-700'}`}>Requests</NavLink>
          <NavLink to="/admin/finance" className={({ isActive }) => `block px-3 py-2 rounded-lg mb-1 ${isActive ? 'bg-primary-600' : 'hover:bg-stone-700'}`}>Finance</NavLink>
        </nav>
        <div className="p-3 border-t border-stone-600">
          <p className="text-stone-400 text-sm truncate">{user?.email}</p>
          <a href="/" onClick={(e) => { e.preventDefault(); logout(); window.location.href = '/'; }} className="text-sm text-primary-300 hover:underline">Sign out</a>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
