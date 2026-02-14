import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500 text-white py-20 px-4">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-white" />
          <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-white" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display font-bold text-4xl md:text-5xl mb-4"
          >
            Share Books, Spread Joy 📚
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-white/95 mb-8"
          >
            Find donated books for your family. Request a delivery from our volunteer drivers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              to="/search"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-xl font-display font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition"
            >
              Find Books
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-center text-stone-800 mb-10">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Browse', desc: 'Search our catalog by age, category, or keyword.', emoji: '🔍' },
              { step: 2, title: 'Request', desc: 'Request a delivery for the books you want.', emoji: '📦' },
              { step: 3, title: 'Receive', desc: 'A volunteer driver brings the books to you.', emoji: '🎉' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-md border border-stone-100 text-center hover:shadow-lg transition"
              >
                <span className="text-4xl mb-3 block">{item.emoji}</span>
                <h3 className="font-display font-bold text-primary-600 text-lg">{item.title}</h3>
                <p className="text-stone-600 mt-2">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-primary-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-2xl text-stone-800 mb-4">Impact in numbers</h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Books shared', value: '1,000+' },
              { label: 'Families reached', value: '500+' },
              { label: 'Volunteer drivers', value: '50+' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-white rounded-xl py-4 px-6 shadow">
                <div className="font-display font-bold text-2xl text-primary-600">{stat.value}</div>
                <div className="text-stone-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
