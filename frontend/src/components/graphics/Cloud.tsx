import { motion } from 'framer-motion'

type Props = { className?: string; delay?: number }

export default function Cloud({ className = '', delay = 0 }: Props) {
  return (
    <motion.div
      className={`text-white/25 text-6xl md:text-7xl ${className}`}
      animate={{
        x: [0, 20, 0],
        opacity: [0.2, 0.35, 0.2],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      ☁️
    </motion.div>
  )
}
