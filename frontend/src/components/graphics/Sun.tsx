import { motion } from 'framer-motion'

type Props = { className?: string }

export default function Sun({ className = '' }: Props) {
  return (
    <motion.span
      className={`inline-block text-amber-200 ${className}`}
      animate={{
        rotate: [0, 10, -10, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      ☀️
    </motion.span>
  )
}
