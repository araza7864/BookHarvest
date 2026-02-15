import { motion } from 'framer-motion'

type Props = { className?: string }

export default function BookStack({ className = '' }: Props) {
  return (
    <motion.div
      className={`inline-flex flex-col items-center gap-0.5 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <motion.span
        className="text-6xl md:text-7xl block"
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        📕
      </motion.span>
      <motion.span
        className="text-6xl md:text-7xl block -mt-3"
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2, delay: 0.2, ease: 'easeInOut' }}
      >
        📗
      </motion.span>
      <motion.span
        className="text-6xl md:text-7xl block -mt-3"
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2, delay: 0.4, ease: 'easeInOut' }}
      >
        📘
      </motion.span>
    </motion.div>
  )
}
