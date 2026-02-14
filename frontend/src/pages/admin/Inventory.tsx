import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../api/client'
import type { Book } from '../../api/client'

export default function AdminInventory() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Book | null>(null)
  const [form, setForm] = useState<Partial<Book>>({})
  const [isNew, setIsNew] = useState(false)

  const load = () => {
    setLoading(true)
    api.get<Book[]>('/books', { params: { limit: 200 } }).then((r) => setBooks(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => load(), [])

  const save = async () => {
    if (editing) {
      await api.put(`/books/${editing.id}`, form)
      setEditing(null)
    } else if (isNew && form.title && form.author) {
      await api.post('/books', form)
      setIsNew(false)
      setForm({})
    }
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this book?')) return
    await api.delete(`/books/${id}`)
    load()
  }

  const openEdit = (book: Book) => {
    setEditing(book)
    setForm({ title: book.title, author: book.author, isbn: book.isbn, age_range: book.age_range, condition: book.condition, category: book.category, description: book.description, photo_url: book.photo_url, status: book.status })
  }

  const openNew = () => {
    setIsNew(true)
    setEditing(null)
    setForm({ title: '', author: '', status: 'available' })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-bold text-2xl text-stone-800">Inventory</h1>
        <button onClick={openNew} className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600">Add book</button>
      </div>

      {(editing || isNew) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-stone-200">
          <h2 className="font-display font-bold mb-4">{editing ? 'Edit book' : 'New book'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="col-span-2 px-3 py-2 border rounded-lg" />
            <input placeholder="Author" value={form.author || ''} onChange={(e) => setForm({ ...form, author: e.target.value })} className="px-3 py-2 border rounded-lg" />
            <input placeholder="ISBN" value={form.isbn || ''} onChange={(e) => setForm({ ...form, isbn: e.target.value })} className="px-3 py-2 border rounded-lg" />
            <input placeholder="Age range" value={form.age_range || ''} onChange={(e) => setForm({ ...form, age_range: e.target.value })} className="px-3 py-2 border rounded-lg" />
            <input placeholder="Category" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 border rounded-lg" />
            <input placeholder="Condition" value={form.condition || ''} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="px-3 py-2 border rounded-lg" />
            <select value={form.status || 'available'} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="available">available</option>
              <option value="reserved">reserved</option>
              <option value="delivered">delivered</option>
            </select>
            <input placeholder="Photo URL" value={form.photo_url || ''} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} className="col-span-2 px-3 py-2 border rounded-lg" />
            <textarea placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="col-span-2 px-3 py-2 border rounded-lg" rows={2} />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={save} className="bg-primary-500 text-white px-4 py-2 rounded-lg">Save</button>
            <button onClick={() => { setEditing(null); setIsNew(false); setForm({}); }} className="bg-stone-200 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="animate-pulse h-64 bg-stone-200 rounded-xl" />
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-100">
              <tr>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Author</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Age</th>
                <th className="p-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} className="border-t border-stone-100 hover:bg-stone-50">
                  <td className="p-3 font-medium">{b.title}</td>
                  <td className="p-3">{b.author}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-sm ${b.status === 'available' ? 'bg-green-100' : b.status === 'delivered' ? 'bg-stone-200' : 'bg-amber-100'}`}>{b.status}</span></td>
                  <td className="p-3">{b.age_range || '—'}</td>
                  <td className="p-3">
                    <button onClick={() => openEdit(b)} className="text-primary-600 hover:underline mr-2">Edit</button>
                    <button onClick={() => remove(b.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
