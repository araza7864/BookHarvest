import { motion } from 'framer-motion'

type Props = {
  emoji: string
  delay?: number
  className?: string
  bounce?: boolean
}

export default function BouncyEmoji({ emoji, delay = 0, className = '', bounce = true }: Props) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        ...(bounce ? { y: [0, -10, 0] } : {}),
      }}
      transition={{
        opacity: { duration: 0.3, delay },
        scale: { duration: 0.4, delay },
        ...(bounce ? { y: { repeat: Infinity, duration: 2, delay, ease: 'easeInOut' as const } } : {}),
      }}
      className={`inline-block ${className}`}
    >
      {emoji}
    </motion.span>
  )
}
