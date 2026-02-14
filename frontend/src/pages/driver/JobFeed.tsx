import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../../api/client'
import type { DeliveryJob } from '../../api/client'

export default function DriverJobs() {
  const [jobs, setJobs] = useState<DeliveryJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<DeliveryJob[]>('/deliveries', { params: { limit: 50 } }).then((r) => setJobs(r.data)).finally(() => setLoading(false))
  }, [])

  const pending = jobs.filter((j) => j.status === 'pending')
  const mine = jobs.filter((j) => j.assigned_driver_id && ['assigned', 'in_transit'].includes(j.status))

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-stone-800 mb-6">Delivery jobs</h1>

      {mine.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display font-bold text-lg text-accent-700 mb-3">My active deliveries</h2>
          <div className="space-y-3">
            {mine.map((j) => (
              <motion.div key={j.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-accent-100 border border-accent-300 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{j.book?.title || `Book #${j.book_id}`}</p>
                  <p className="text-sm text-stone-600">{j.distance_miles != null ? `${j.distance_miles} mi` : '—'} · {j.credit_reward} credits</p>
                </div>
                <Link to={`/driver/job/${j.id}`} className="bg-accent-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-700">View</Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display font-bold text-lg text-stone-700 mb-3">Available (pending)</h2>
        {loading ? (
          <div className="animate-pulse h-32 bg-stone-200 rounded-xl" />
        ) : pending.length === 0 ? (
          <p className="text-stone-500">No pending deliveries right now.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((j, i) => (
              <motion.div
                key={j.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl shadow border border-stone-200 p-4 hover:shadow-md transition"
              >
                <p className="font-bold text-stone-800">{j.book?.title || `Book #${j.book_id}`}</p>
                <p className="text-sm text-stone-500">{j.dropoff_location || '—'}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-primary-600 font-semibold">{j.credit_reward} credits</span>
                  {j.distance_miles != null && <span className="text-stone-500 text-sm">{j.distance_miles} mi</span>}
                </div>
                <Link to={`/driver/job/${j.id}`} className="mt-3 block w-full text-center bg-primary-500 text-white py-2 rounded-lg font-medium hover:bg-primary-600">View & accept</Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
