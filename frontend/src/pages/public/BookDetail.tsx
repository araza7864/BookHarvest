import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../api/client'
import type { Book } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export default function BookDetail() {
  const { id } = useParams()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [requestSent, setRequestSent] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!id) return
    api.get<Book>(`/books/${id}`)
      .then((r) => setBook(r.data))
      .catch(() => setBook(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleRequestDelivery = () => {
    if (!book || !user) return
    setRequestSent(true)
    // In a full flow, we'd collect address and call POST /deliveries (admin only in current API). For public we show a message.
    alert('Delivery requests are handled by admins. An admin will create a delivery for this book and assign a driver. Thank you!')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-stone-200 rounded-2xl h-96 animate-pulse" />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-stone-500">Book not found.</p>
        <Link to="/search" className="text-primary-600 hover:underline mt-2 inline-block">Back to search</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row"
      >
        <div className="md:w-1/3 aspect-[3/4] bg-primary-100 flex items-center justify-center text-8xl min-h-[320px]">
          {book.photo_url ? (
            <img src={book.photo_url} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <span>📖</span>
          )}
        </div>
        <div className="md:w-2/3 p-8 flex flex-col">
          <div className="flex flex-wrap gap-2 mb-4">
            {book.age_range && (
              <span className="px-3 py-1 bg-primary-500 text-white rounded-full text-sm font-medium">
                Age {book.age_range}
              </span>
            )}
            {book.category && (
              <span className="px-3 py-1 bg-accent-500 text-white rounded-full text-sm">
                {book.category}
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm ${book.status === 'available' ? 'bg-green-500 text-white' : 'bg-stone-300 text-stone-600'}`}>
              {book.status}
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl text-stone-800">{book.title}</h1>
          <p className="text-xl text-stone-600 mt-1">{book.author}</p>
          {book.description && <p className="text-stone-600 mt-4">{book.description}</p>}
          {book.condition && <p className="text-stone-500 text-sm mt-2">Condition: {book.condition}</p>}
          <div className="mt-auto pt-6">
            {book.status === 'available' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRequestDelivery}
                className="bg-primary-500 text-white px-6 py-3 rounded-xl font-display font-bold text-lg hover:bg-primary-600"
              >
                {requestSent ? 'Request noted!' : 'Request delivery'}
              </motion.button>
            )}
            <Link to="/search" className="ml-4 text-primary-600 hover:underline inline-block mt-2">← Back to search</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
