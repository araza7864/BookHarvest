import { motion } from 'framer-motion'

type Props = { className?: string }

export default function RainbowDivider({ className = '' }: Props) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`h-2 rounded-full overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(90deg, #f97316, #eab308, #22c55e, #14b8a6, #3b82f6, #a855f7)',
        transformOrigin: 'left',
      }}
    />
  )
}
