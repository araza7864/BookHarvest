import { useState, useEffect } from 'react'
import { api } from '../../api/client'

type Analytics = { credits_issued: number; deliveries?: { delivered: number } }

export default function AdminFinance() {
  const [data, setData] = useState<Analytics | null>(null)

  useEffect(() => {
    api.get<Analytics>('/admin/analytics').then((r) => setData(r.data)).catch(() => setData(null))
  }, [])

  if (!data) return <div className="animate-pulse h-32 bg-stone-200 rounded-xl" />

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-stone-800 mb-6">Finance</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-display font-bold text-lg mb-2">Credits issued</h2>
          <p className="text-3xl font-bold text-primary-600">{data.credits_issued.toFixed(1)}</p>
          <p className="text-stone-500 text-sm mt-1">Total credits awarded to drivers for completed deliveries.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-display font-bold text-lg mb-2">Delivery costs</h2>
          <p className="text-stone-600">Track delivery costs and driver rewards in the Deliveries board. Credits are issued when a delivery is marked complete.</p>
        </div>
      </div>
    </div>
  )
}
