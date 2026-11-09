import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import AnimatedSection from '../../components/animations/AnimatedSection'
import AnimatedCard from '../../components/animations/AnimatedCard'
import BouncyEmoji from '../../components/animations/BouncyEmoji'
import FloatingBooks from '../../components/graphics/FloatingBooks'
import Stars from '../../components/graphics/Stars'
import BookStack from '../../components/graphics/BookStack'
import FloatingHearts from '../../components/graphics/FloatingHearts'
import ReadingKid from '../../components/graphics/ReadingKid'

const MAX_TILT_X = 20
const MAX_TILT_Y = 24
const TILT_FACTOR = 0.14

export default function Home() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const btnRef = useRef<HTMLDivElement>(null)

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!btnRef.current) return
      const rect = btnRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const rotateY = Math.max(-MAX_TILT_Y, Math.min(MAX_TILT_Y, dx * TILT_FACTOR))
      const rotateX = Math.max(-MAX_TILT_X, Math.min(MAX_TILT_X, -dy * TILT_FACTOR))
      setTilt({ x: rotateX, y: rotateY })
    },
    []
  )

  const onMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), [])

  useEffect(() => {
    const handleMove = (e: MouseEvent) => onMouseMove(e)
    const handleLeave = () => onMouseLeave()
    window.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
    }
  }, [onMouseMove, onMouseLeave])

  return (
    <div className="bg-harvest-bg-page min-w-0 overflow-x-hidden">
      <div className="flex h-2">
        <div className="flex-1 bg-harvest-dark-teal" />
        <div className="flex-1 bg-harvest-dark-red" />
        <div className="flex-1 bg-harvest-green" />
        <div className="flex-1 bg-harvest-ochre" />
        <div className="flex-1 bg-harvest-burnt-orange" />
      </div>
      <section className="relative overflow-hidden bg-harvest-bg-cool text-white py-24 px-4">
        <FloatingBooks />
        <Stars />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-white" />
          <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-white" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 150, damping: 12 }}
            className="mb-4"
          >
            <BookStack />
          </motion.div>
          <AnimatedSection variant="fadeInUp" delay={0.1} className="text-center">
            <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl mb-4">
              Share Books, Spread Joy
            </h1>
          </AnimatedSection>
          <AnimatedSection variant="fadeInUp" delay={0.2}>
            <p className="text-xl md:text-2xl text-white/95 mb-6">
              Find donated books for your family. Browse and pick up books at community hubs.
            </p>
            <ReadingKid className="text-5xl md:text-6xl" />
          </AnimatedSection>
          <div className="mt-10 mb-2" />
          <AnimatedSection variant="fadeInUp" delay={0.35}>
            <div className="inline-block py-6 px-4" style={{ perspective: 800 }}>
              <motion.div
                ref={btnRef}
                style={{
                  rotateX: tilt.x,
                  rotateY: tilt.y,
                  transformStyle: 'preserve-3d',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                <a
                  id="hero-find-books"
                  href="/search"
                  className="inline-block bg-white text-[rgb(144,54,23)] px-10 py-4 rounded-2xl font-display font-bold text-xl md:text-2xl shadow-lg hover:bg-white/95 transition"
                  style={{ transform: 'translateZ(12px)', backfaceVisibility: 'hidden' }}
                >
                  Find Books
                </a>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <div className="flex h-2">
        <div className="flex-1 bg-harvest-burnt-orange" />
        <div className="flex-1 bg-harvest-ochre" />
        <div className="flex-1 bg-harvest-green" />
        <div className="flex-1 bg-harvest-dark-red" />
        <div className="flex-1 bg-harvest-dark-teal" />
      </div>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection variant="fadeInUp" delay={0}>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-center text-white drop-shadow-sm mb-12">How it works</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: 1, title: 'Browse', desc: 'Search our catalog by age, category, or keyword.', emoji: '🔍' },
              { step: 2, title: 'Request', desc: 'Request the books you want.', emoji: '📖' },
              { step: 3, title: 'Access Books', desc: 'Pick up books through community book hubs and literacy programs.', emoji: '📍' },
            ].map((item, i) => (
              <AnimatedCard key={item.step} delay={i * 0.1} className="bg-white rounded-2xl p-8 shadow-md border border-stone-100 text-center">
                <BouncyEmoji emoji={item.emoji} delay={i * 0.1} bounce={false} className="text-6xl md:text-7xl mb-4 block" />
                <h3 className="font-display font-bold text-harvest-text text-xl md:text-2xl">{item.title}</h3>
                <p className="text-stone-600 mt-3 text-base md:text-lg">{item.desc}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-primary-50 relative overflow-hidden">
        <Stars className="opacity-60" />
        <FloatingHearts className="opacity-50" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <AnimatedSection variant="fadeInUp">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-harvest-text mb-6">Impact in numbers</h2>
          </AnimatedSection>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Books Provided', value: '3M+', emoji: '🌟' },
              { label: 'Families Reached', value: 'Thousands+', emoji: '👨‍👩‍👧‍👦' },
              { label: 'Community Book Hubs', value: '100+', emoji: '🏠' },
            ].map((stat, i) => (
              <AnimatedCard key={stat.label} delay={i * 0.1} className="bg-white rounded-2xl py-6 px-6 shadow">
                <BouncyEmoji emoji={stat.emoji} delay={i * 0.1} bounce={false} className="text-4xl md:text-5xl block mb-2" />
                <div className="font-display font-bold text-2xl md:text-3xl text-harvest-burnt-orange">{stat.value}</div>
                <div className="text-stone-600 text-base">{stat.label}</div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
