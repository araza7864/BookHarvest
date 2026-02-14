import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

type CreditsResponse = { balance: number; transactions: { id: number; amount: number; reason: string | null; created_at: string }[] }

export default function DriverCredits() {
  const [data, setData] = useState<CreditsResponse | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    api.get<CreditsResponse>('/drivers/me/credits').then((r) => setData(r.data)).catch(() => setData(null))
  }, [])

  const balance = data?.balance ?? (user as any)?.credits_balance ?? 0

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-stone-800 mb-6">Credits wallet</h1>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-accent-500 to-accent-700 text-white rounded-2xl p-8 shadow-lg mb-8">
        <p className="text-accent-100 text-sm font-medium">Current balance</p>
        <p className="text-4xl font-display font-bold mt-1">{balance.toFixed(1)} credits</p>
        <p className="text-accent-200 text-sm mt-2">Earn credits by completing deliveries.</p>
      </motion.div>

      <div className="bg-white rounded-xl shadow border border-stone-200 overflow-hidden">
        <h2 className="font-display font-bold text-lg p-4 border-b">History</h2>
        {!data ? (
          <div className="animate-pulse h-32 bg-stone-100" />
        ) : data.transactions.length === 0 ? (
          <p className="p-6 text-stone-500">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {data.transactions.map((t) => (
              <li key={t.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{t.reason || 'Credit'}</p>
                  <p className="text-stone-500 text-sm">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-green-600 font-semibold">+{t.amount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
        <h3 className="font-display font-bold text-primary-800 mb-2">Rewards catalog</h3>
        <p className="text-stone-600 text-sm">Use your credits for rewards (configure in your organization). Keep delivering to earn more!</p>
      </div>
    </div>
  )
}
