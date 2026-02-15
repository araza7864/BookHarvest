import { motion } from 'framer-motion'

type Props = { className?: string }

const colors = ['text-red-300', 'text-pink-300', 'text-amber-200']

export default function FloatingHearts({ className = '' }: Props) {
  const hearts = [
    { x: '15%', y: '20%', delay: 0, size: 20 },
    { x: '88%', y: '30%', delay: 0.8, size: 18 },
    { x: '25%', y: '75%', delay: 0.4, size: 22 },
    { x: '80%', y: '70%', delay: 1.2, size: 16 },
    { x: '50%', y: '45%', delay: 0.2, size: 18 },
  ]

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {hearts.map((h, i) => (
        <motion.span
          key={i}
          className={`absolute ${colors[i % colors.length]} opacity-60`}
          style={{ left: h.x, top: h.y, fontSize: h.size }}
          animate={{
            y: [0, -12, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: h.delay,
            ease: 'easeInOut',
          }}
        >
          ❤️
        </motion.span>
      ))}
    </div>
  )
}
