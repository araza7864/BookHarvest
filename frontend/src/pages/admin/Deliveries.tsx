import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../api/client'
import type { DeliveryJob } from '../../api/client'

const COLS = ['pending', 'assigned', 'in_transit', 'delivered'] as const

export default function AdminDeliveries() {
  const [jobs, setJobs] = useState<DeliveryJob[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [bookId, setBookId] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [creditReward, setCreditReward] = useState('5')

  const load = () => {
    api.get<DeliveryJob[]>('/deliveries', { params: { limit: 200 } }).then((r) => setJobs(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => load(), [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookId.trim()) return
    await api.post('/deliveries', { book_id: parseInt(bookId, 10), dropoff_location: dropoff, credit_reward: parseFloat(creditReward) || 0 })
    setCreating(false)
    setBookId('')
    setDropoff('')
    setCreditReward('5')
    load()
  }

  const byStatus = (status: string) => jobs.filter((j) => j.status === status)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-bold text-2xl text-stone-800">Deliveries</h1>
        <button onClick={() => setCreating(true)} className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600">New delivery</button>
      </div>

      {creating && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={create} className="bg-white rounded-xl shadow p-6 mb-6 border">
          <h2 className="font-display font-bold mb-4">Create delivery</h2>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Book ID" value={bookId} onChange={(e) => setBookId(e.target.value)} required className="px-3 py-2 border rounded-lg" />
            <input placeholder="Dropoff location" value={dropoff} onChange={(e) => setDropoff(e.target.value)} className="px-3 py-2 border rounded-lg" />
            <input type="number" step="0.5" placeholder="Credit reward" value={creditReward} onChange={(e) => setCreditReward(e.target.value)} className="px-3 py-2 border rounded-lg" />
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="bg-primary-500 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setCreating(false)} className="bg-stone-200 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="animate-pulse h-64 bg-stone-200 rounded-xl" />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {COLS.map((status) => (
            <div key={status} className="bg-stone-100 rounded-xl p-4 min-h-[200px]">
              <h3 className="font-display font-bold text-stone-700 capitalize mb-3">{status.replace('_', ' ')}</h3>
              <div className="space-y-2">
                {byStatus(status).map((j) => (
                  <motion.div
                    key={j.id}
                    layout
                    className="bg-white rounded-lg p-3 shadow border border-stone-200"
                  >
                    <p className="font-medium text-sm">{j.book?.title || `Book #${j.book_id}`}</p>
                    <p className="text-xs text-stone-500">{j.dropoff_location || '—'}</p>
                    <p className="text-xs text-primary-600">{j.credit_reward} credits</p>
                    {j.assigned_driver && <p className="text-xs text-stone-600">Driver: {j.assigned_driver.name}</p>}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
