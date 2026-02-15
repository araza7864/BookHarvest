import { motion } from 'framer-motion'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function PulseBadge({ children, className = '' }: Props) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      animate={{
        scale: [1, 1.05, 1],
        boxShadow: ['0 0 0 0 rgba(249, 115, 22, 0.4)', '0 0 0 8px rgba(249, 115, 22, 0)'],
      }}
      transition={{
        scale: { duration: 2, repeat: Infinity },
        boxShadow: { duration: 2, repeat: Infinity },
      }}
    >
      {children}
    </motion.span>
  )
}
