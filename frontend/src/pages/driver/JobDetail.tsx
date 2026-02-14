import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../api/client'
import type { DeliveryJob } from '../../api/client'
import type { MPGEstimate } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export default function DriverJobDetail() {
  const { id } = useParams()
  const [job, setJob] = useState<DeliveryJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [mpgEstimate, setMpgEstimate] = useState<MPGEstimate | null>(null)
  const [gasPrice, setGasPrice] = useState('3.50')
  const { user } = useAuth()

  useEffect(() => {
    if (!id) return
    api.get<DeliveryJob>(`/deliveries/${id}`).then((r) => setJob(r.data)).catch(() => setJob(null)).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!job?.distance_miles || !user?.vehicle_mpg) return
    const run = async () => {
      const { data } = await api.post<MPGEstimate>('/mpg/estimate', {
        distance_miles: job.distance_miles,
        vehicle_mpg: user.vehicle_mpg,
        gas_price: parseFloat(gasPrice) || 3.5,
        credit_reward: job.credit_reward,
      })
      setMpgEstimate(data)
    }
    run()
  }, [job?.distance_miles, job?.credit_reward, user?.vehicle_mpg, gasPrice])

  const accept = async () => {
    if (!job) return
    await api.post(`/deliveries/${job.id}/accept`)
    setJob({ ...job, status: 'assigned', assigned_driver_id: (user as any)?.id })
  }

  const startTransit = async () => {
    if (!job) return
    await api.post(`/deliveries/${job.id}/start`)
    setJob({ ...job, status: 'in_transit' })
  }

  const complete = async () => {
    if (!job) return
    await api.post(`/deliveries/${job.id}/complete`)
    setJob({ ...job, status: 'delivered' })
  }

  if (loading || !job) {
    return (
      <div className="animate-pulse h-64 bg-stone-200 rounded-xl" />
    )
  }

  const isMine = job.assigned_driver_id === (user as any)?.id
  const canAccept = job.status === 'pending'
  const canStart = job.status === 'assigned' && isMine
  const canComplete = job.status === 'in_transit' && isMine

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/driver" className="text-accent-700 hover:underline mb-4 inline-block">← Back to jobs</Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h1 className="font-display font-bold text-2xl text-stone-800">{job.book?.title || `Book #${job.book_id}`}</h1>
          <p className="text-stone-600">{job.book?.author}</p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 bg-stone-200 rounded text-sm capitalize">{job.status.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-stone-500 text-sm">Pickup</p>
            <p className="font-medium">{job.pickup_location || '—'}</p>
          </div>
          <div>
            <p className="text-stone-500 text-sm">Dropoff</p>
            <p className="font-medium">{job.dropoff_location || '—'}</p>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-stone-500 text-sm">Distance</p>
              <p className="font-bold">{job.distance_miles != null ? `${job.distance_miles} mi` : '—'}</p>
            </div>
            <div>
              <p className="text-stone-500 text-sm">Credit reward</p>
              <p className="font-bold text-primary-600">{job.credit_reward} credits</p>
            </div>
          </div>

          {/* MPG cost estimator */}
          {job.distance_miles != null && (user as any)?.vehicle_mpg && (
            <div className="bg-accent-50 rounded-xl p-4 border border-accent-200">
              <h3 className="font-display font-bold text-accent-800 mb-2">MPG cost estimator</h3>
              <div className="flex gap-2 items-center mb-2">
                <label className="text-sm text-stone-600">Gas price ($/gal)</label>
                <input type="number" step="0.01" value={gasPrice} onChange={(e) => setGasPrice(e.target.value)} className="w-20 px-2 py-1 border rounded" />
              </div>
              {mpgEstimate && (
                <div className="space-y-1 text-sm">
                  <p><strong>Fuel cost:</strong> ${mpgEstimate.fuel_cost.toFixed(2)}</p>
                  <p><strong>Net profit (credits value − fuel):</strong> <span className={mpgEstimate.net_reward >= 0 ? 'text-green-700 font-bold' : 'text-red-700'}>{mpgEstimate.net_reward >= 0 ? '+' : ''}{mpgEstimate.net_reward.toFixed(2)}</span></p>
                </div>
              )}
            </div>
          )}

          {job.requester_notes && (
            <div>
              <p className="text-stone-500 text-sm">Notes</p>
              <p className="text-stone-700">{job.requester_notes}</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-stone-50 border-t flex flex-wrap gap-3">
          {canAccept && <button onClick={accept} className="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600">Accept delivery</button>}
          {canStart && <button onClick={startTransit} className="bg-accent-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-accent-600">Start (in transit)</button>}
          {canComplete && <button onClick={complete} className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600">Mark delivered</button>}
        </div>
      </motion.div>

      {/* Step tracking */}
      {isMine && (
        <div className="mt-6 flex justify-between items-center text-sm">
          {['Pickup', 'Confirm', 'Navigate', 'Dropoff', 'Complete'].map((step, i) => (
            <span key={step} className={`px-2 py-1 rounded ${i <= ['pending', 'assigned', 'in_transit', 'delivered'].indexOf(job.status) + 1 ? 'bg-accent-200 text-accent-800' : 'bg-stone-200 text-stone-500'}`}>{step}</span>
          ))}
        </div>
      )}
    </div>
  )
}
