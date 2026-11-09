import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Sparkles from '../components/graphics/Sparkles'
import BookHarvestLogo from '../components/graphics/BookHarvestLogo'


export default function PublicLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [heroFindBooksVisible, setHeroFindBooksVisible] = useState(false)

  useEffect(() => {
    let obs: IntersectionObserver | null = null
    const tick = requestAnimationFrame(() => {
      const el = document.getElementById('hero-find-books')
      if (!el) {
        setHeroFindBooksVisible(false)
        return
      }
      obs = new IntersectionObserver(
        ([e]) => setHeroFindBooksVisible(e.isIntersecting),
        { threshold: 0.1, rootMargin: '0px' }
      )
      obs.observe(el)
    })
    return () => {
      cancelAnimationFrame(tick)
      obs?.disconnect()
    }
  }, [location.pathname])

  const showNavFindBooks = !heroFindBooksVisible

  return (
    <div className="min-h-screen flex flex-col bg-harvest-bg-page w-full">
      <header className="sticky top-0 z-[100] w-full bg-white shadow-md rounded-b-xl shrink-0">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Home">
            <BookHarvestLogo height={80} />
            <span className="font-display font-bold text-[28px] text-harvest-dark-red">Book Harvest</span>
          </Link>
          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              {showNavFindBooks && (
                <motion.div
                  key="nav-find-books"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <a
                    href="/search"
                    className="flex flex-wrap text-harvest-dark-red border border-harvest-dark-red px-4 py-2 rounded-lg font-medium text-base opacity-90 hover:opacity-100 transition"
                  >
                    Find Books
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="border border-harvest-dark-red text-harvest-dark-red px-4 py-2 rounded-lg font-medium text-base opacity-90 hover:opacity-100 transition"
                  >
                    Admin
                  </Link>
                )}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button
                    type="button"
                    onClick={() => { logout(); window.location.href = '/' }}
                    className="border border-harvest-dark-red text-harvest-dark-red px-4 py-2 rounded-lg font-medium text-base hover:opacity-90 transition"
                  >
                    Log out
                  </button>
                </motion.div>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/login"
                  className="border border-harvest-dark-red text-harvest-dark-red px-4 py-2 rounded-lg font-medium text-base hover:opacity-90 transition"
                >
                  Log in
                </Link>
              </motion.div>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-1 bg-harvest-bg-page overflow-x-hidden min-w-0">
        <Outlet />
      </main>
      <footer className="bg-harvest-bg-warm border-t border-black/10 py-8 text-center text-white/90 text-base md:text-lg relative overflow-hidden">
        <Sparkles className="opacity-40" count={5} />
        <span className="relative z-10">Book Harvest — Share Books, Spread Joy</span>
      </footer>
    </div>
  )
}
