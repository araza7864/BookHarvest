import { motion } from 'framer-motion'

type Props = { className?: string; count?: number }

export default function Stars({ className = '', count = 12 }: Props) {
  const positions = Array.from({ length: count }, (_, i) => ({
    left: `${5 + (i * 7) % 90}%`,
    top: `${10 + (i * 11) % 80}%`,
    size: 14 + (i % 3) * 6,
    delay: i * 0.15,
    duration: 1.5 + (i % 3) * 0.5,
  }))

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {positions.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-amber-200"
          style={{
            left: p.left,
            top: p.top,
            fontSize: p.size,
          }}
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
          }}
        >
          ★
        </motion.span>
      ))}
    </div>
  )
}
