import { motion } from 'framer-motion'

type Props = { className?: string; count?: number }

export default function Sparkles({ className = '', count = 8 }: Props) {
  const positions = Array.from({ length: count }, (_, i) => ({
    left: `${8 + (i * 12) % 84}%`,
    top: `${15 + (i * 9) % 70}%`,
    delay: i * 0.2,
    scale: 0.8 + (i % 3) * 0.4,
  }))

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {positions.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-amber-100"
          style={{ left: p.left, top: p.top, fontSize: 14 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [p.scale * 0.5, p.scale, p.scale * 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: p.delay,
          }}
        >
          ✨
        </motion.span>
      ))}
    </div>
  )
}
