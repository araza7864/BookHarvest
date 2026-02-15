import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../api/client'
import type { Book } from '../../api/client'

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api
      .get<Book>(`/books/${id}`)
      .then((r) => setBook(r.data))
      .catch(() => setBook(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen bg-harvest-bg-page flex items-center justify-center"><p className="text-stone-500">Loading...</p></div>
  if (!book) return <div className="min-h-screen bg-harvest-bg-page flex items-center justify-center"><p className="text-stone-600">Book not found.</p><Link to="/search" className="ml-2 text-harvest-dark-red hover:underline">Back to search</Link></div>

  return (
    <div className="min-h-screen bg-harvest-bg-page py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/search" className="text-stone-600 hover:underline text-sm mb-4 inline-block">← Back to search</Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden"
        >
          <div className="md:flex">
            <div className="md:w-1/2">
              {book.photo_url ? (
                <img src={book.photo_url} alt="" className="w-full h-72 md:h-full object-cover" />
              ) : (
                <div className="w-full h-72 md:min-h-[320px] bg-stone-200 flex items-center justify-center text-6xl">📚</div>
              )}
            </div>
            <div className="p-6 md:p-8 md:w-1/2 flex flex-col">
              <h1 className="font-display font-bold text-2xl md:text-3xl text-stone-800">{book.title}</h1>
              <p className="text-stone-600 text-lg mt-1">{book.author}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {book.age_range && <span className="bg-stone-100 text-stone-700 px-2 py-1 rounded text-sm">{book.age_range}</span>}
                {book.category && <span className="bg-stone-100 text-stone-700 px-2 py-1 rounded text-sm">{book.category}</span>}
                {book.condition && <span className="bg-stone-100 text-stone-700 px-2 py-1 rounded text-sm">{book.condition}</span>}
              </div>
              {book.description && <p className="text-stone-600 mt-4">{book.description}</p>}
              <p className="mt-auto pt-6">
                <span className="inline-block bg-harvest-dark-red text-white px-8 py-4 rounded-xl font-display font-bold text-xl hover:opacity-90 shadow-md transition cursor-default">
                  {book.status === 'available' ? 'Available' : book.status}
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
