import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import DriverLayout from './layouts/DriverLayout'

import Home from './pages/public/Home'
import Search from './pages/public/Search'
import BookDetail from './pages/public/BookDetail'
import Login from './pages/Login'

import AdminDashboard from './pages/admin/Dashboard'
import AdminInventory from './pages/admin/Inventory'
import AdminDeliveries from './pages/admin/Deliveries'
import AdminFinance from './pages/admin/Finance'

import DriverJobs from './pages/driver/JobFeed'
import DriverJobDetail from './pages/driver/JobDetail'
import DriverCredits from './pages/driver/CreditsWallet'

function RequireAuth({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, token } = useAuth()
  if (!token || !user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="book/:id" element={<BookDetail />} />
        </Route>
        <Route path="/admin" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
          <Route index element={<AdminDashboard />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="deliveries" element={<AdminDeliveries />} />
          <Route path="finance" element={<AdminFinance />} />
        </Route>
        <Route path="/driver" element={<RequireAuth role="driver"><DriverLayout /></RequireAuth>}>
          <Route index element={<DriverJobs />} />
          <Route path="job/:id" element={<DriverJobDetail />} />
          <Route path="credits" element={<DriverCredits />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
