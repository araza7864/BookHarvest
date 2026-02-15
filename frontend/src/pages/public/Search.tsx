import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../../api/client'
import type { Book } from '../../api/client'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const age = searchParams.get('age_range') ?? ''
  const category = searchParams.get('category') ?? ''

  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(q)
  const [ageRange, setAgeRange] = useState(age)
  const [cat, setCat] = useState(category)

  useEffect(() => {
    setLoading(true)
    api
      .get<Book[]>('/books/search', {
        params: {
          q: query || undefined,
          age_range: ageRange || undefined,
          category: cat || undefined,
        },
      })
      .then((r) => setBooks(r.data))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false))
  }, [query, ageRange, cat])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams(
      { ...(query && { q: query }), ...(ageRange && { age_range: ageRange }), ...(cat && { category: cat }) },
      { replace: true }
    )
  }

  return (
    <div className="min-h-screen bg-harvest-bg-page py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display font-bold text-3xl mb-6" style={{ color: 'var(--tw-ring-offset-color)' }}>
          Find Books <span className="text-base font-display font-bold text-white">To get books, log in</span>
        </h1>
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-8">
          <input
            type="search"
            placeholder="Search by keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg flex-1 min-w-[200px]"
          />
          <select
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg"
          >
            <option value="">All ages</option>
            <option value="0-3">0-3</option>
            <option value="4-6">4-6</option>
            <option value="7-9">7-9</option>
            <option value="10-12">10-12</option>
            <option value="13+">13+</option>
          </select>
          <input
            type="text"
            placeholder="Category"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg w-40"
          />
          <button type="submit" className="bg-harvest-dark-red text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90">
            Search
          </button>
        </form>

        {loading ? (
          <p className="text-stone-500">Loading...</p>
        ) : books.length === 0 ? (
          <p className="text-stone-600">No books found. Try different filters.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/book/${book.id}`}
                  className="block bg-white rounded-xl shadow-md border border-stone-200 p-4 hover:shadow-lg transition"
                >
                  {book.photo_url ? (
                    <img src={book.photo_url} alt="" className="w-full h-48 object-cover rounded-lg mb-3" />
                  ) : (
                    <div className="w-full h-48 bg-stone-200 rounded-lg mb-3 flex items-center justify-center text-stone-400 text-4xl">📚</div>
                  )}
                  <h2 className="font-display font-bold text-lg text-stone-800 truncate">{book.title}</h2>
                  <p className="text-stone-600 text-sm">{book.author}</p>
                  {(book.age_range || book.category) && (
                    <p className="text-stone-500 text-xs mt-1">
                      {[book.age_range, book.category].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
