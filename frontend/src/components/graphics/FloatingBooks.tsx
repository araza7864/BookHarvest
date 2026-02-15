import { motion } from 'framer-motion'

type Props = { className?: string }

export default function FloatingBooks({ className = '' }: Props) {
  const books = [
    { x: '10%', y: '15%', delay: 0, size: 24 },
    { x: '85%', y: '25%', delay: 0.5, size: 32 },
    { x: '20%', y: '70%', delay: 1, size: 28 },
    { x: '75%', y: '65%', delay: 0.3, size: 20 },
    { x: '50%', y: '40%', delay: 0.8, size: 18 },
  ]

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {books.map((b, i) => (
        <motion.div
          key={i}
          className="absolute text-white/30"
          style={{ left: b.x, top: b.y, fontSize: b.size }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: b.delay,
            ease: 'easeInOut',
          }}
        >
          📖
        </motion.div>
      ))}
    </div>
  )
}
