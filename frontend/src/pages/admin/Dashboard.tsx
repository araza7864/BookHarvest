import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../api/client'

type Analytics = {
  books: { total: number; available: number; delivered: number }
  deliveries: { total: number; pending: number; delivered: number }
  credits_issued: number
}

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null)

  useEffect(() => {
    api.get<Analytics>('/admin/analytics').then((r) => setData(r.data)).catch(() => setData(null))
  }, [])

  if (!data) return <div className="animate-pulse h-32 bg-stone-200 rounded-xl" />

  const kpis = [
    { label: 'Total books', value: data.books.total, color: 'bg-primary-500' },
    { label: 'Available', value: data.books.available, color: 'bg-green-500' },
    { label: 'Delivered', value: data.books.delivered, color: 'bg-accent-500' },
    { label: 'Pending deliveries', value: data.deliveries.pending, color: 'bg-amber-500' },
    { label: 'Credits issued', value: data.credits_issued.toFixed(1), color: 'bg-stone-600' },
  ]

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-stone-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${kpi.color} text-white rounded-xl p-4 shadow`}
          >
            <div className="text-2xl font-bold">{kpi.value}</div>
            <div className="text-white/90 text-sm">{kpi.label}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-display font-bold text-lg mb-4">Books overview</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Total</span><span>{data.books.total}</span></div>
            <div className="flex justify-between"><span>Available</span><span>{data.books.available}</span></div>
            <div className="flex justify-between"><span>Delivered</span><span>{data.books.delivered}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-display font-bold text-lg mb-4">Deliveries</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Total</span><span>{data.deliveries.total}</span></div>
            <div className="flex justify-between"><span>Pending</span><span>{data.deliveries.pending}</span></div>
            <div className="flex justify-between"><span>Delivered</span><span>{data.deliveries.delivered}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
