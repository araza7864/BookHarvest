import { motion } from 'framer-motion'

type Props = { className?: string; delay?: number }

export default function WavingHand({ className = '', delay = 0 }: Props) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      animate={{ rotate: [0, 14, -8, 14, 0] }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        repeatDelay: 2,
        delay,
      }}
    >
      👋
    </motion.span>
  )
}
