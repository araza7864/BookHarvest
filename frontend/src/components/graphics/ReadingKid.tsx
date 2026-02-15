import { motion } from 'framer-motion'

type Props = { className?: string }

export default function ReadingKid({ className = '' }: Props) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 150 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
    >
      📖👧
    </motion.span>
  )
}
