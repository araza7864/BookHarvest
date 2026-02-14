import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../api/client'
import type { Book } from '../../api/client'

export default function Search() {
  const [q, setQ] = useState('')
  const [age, setAge] = useState('')
  const [category, setCategory] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      api.get<Book[]>('/books/search', { params: { q: q || undefined, age_range: age || undefined, category: category || undefined } })
        .then((r) => setBooks(r.data))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [q, age, category])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="font-display font-bold text-3xl text-primary-700 mb-6">
        Find Books
      </motion.h1>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-md p-4 mb-8 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by title, author, or keyword..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="text"
          placeholder="Age range (e.g. 5-8)"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-32 px-4 py-2 border border-stone-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-36 px-4 py-2 border border-stone-300 rounded-lg"
        />
      </motion.div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-stone-200 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
          >
            {books.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-stone-100"
              >
                <Link to={`/book/${book.id}`} className="block">
                  <div className="aspect-[3/4] bg-primary-100 flex items-center justify-center text-5xl">
                    {book.photo_url ? (
                      <img src={book.photo_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <span>📖</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-display font-bold text-stone-800 line-clamp-2">{book.title}</h3>
                    <p className="text-stone-500 text-sm">{book.author}</p>
                    {book.age_range && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">
                        {book.age_range}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && books.length === 0 && (
        <p className="text-center text-stone-500 py-12">No books found. Try different filters.</p>
      )}
    </div>
  )
}
